// controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../helpers/sendEmail');
const generateOtp = require('../helpers/generateOtp');
const generateVerificationToken = require('../helpers/generateToken');
const PasswordValidator = require('password-validator');


// Password validation schema
const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(6)                    // Minimum length 6
  .is().max(30)                   // Maximum length 30
  .has().uppercase()              // Must have uppercase letters
  .has().lowercase()              // Must have lowercase letters
  .has().digits(1)                // Must have at least 1 digit
  .has().symbols(1)               // Must have at least 1 special character
  .has().not().spaces()           // Should not have spaces
  .is().not().oneOf(['Password123', '123456']); // Blacklist common passwords


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validations
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Password strength validation (as before)
    const passwordErrors = passwordSchema.validate(password, { list: true });
    if (passwordErrors.length > 0) {
      const errorMessages = {
        min: 'Password must be at least 6 characters long',
        max: 'Password cannot exceed 30 characters',
        uppercase: 'Password must contain at least one uppercase letter',
        lowercase: 'Password must contain at least one lowercase letter',
        digits: 'Password must contain at least one number',
        symbols: 'Password must contain at least one special character (e.g., !@#$%)',
        spaces: 'Password should not contain spaces',
        oneOf: 'Password is too common, choose a stronger password'
      };
      const readableErrors = passwordErrors.map(err => errorMessages[err] || err);
      return res.status(400).json({ msg: readableErrors.join(', ') });
    }

    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Please enter a valid email address' });
    }

    // Check if user already exists (to avoid sending email unnecessarily)
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: `This email "${email}" is already registered!` });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #e50914;">Welcome to Flick Hub!</h2>
            <p>Hello ${name},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verifyUrl}" style="display: inline-block; background-color: #e50914; color: #fff; padding: 10px 20px; text-decoration: none;">Verify Email</a>
            <p>This link expires in 24 hours.</p>
            <p>If you didn't create an account, ignore this email.</p>
            <p>Regards,<br/>Flick Hub Team</p>
          </div>
        </body>
      </html>
    `;
    try {
      await sendEmail(email, 'Verify your email address', htmlContent);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      let errorMsg = 'Unable to send verification email. Please check your email address or try again later.';
      if (emailError.code === 'MessageRejected') {
        errorMsg = 'Wrong Email. Please use a valid email address.';
      }
      return res.status(500).json({ msg: errorMsg });
    }

    // Email sent successfully → now create the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let baseUsername = email.split('@')[0];
    let username = baseUsername;
    let count = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${count}`;
      count++;
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      username,
      isVerified: false,
      verificationToken,
      verificationTokenExpire,
    });

    await user.save();

    res.status(201).json({ msg: 'Registration successful! Please check your email to verify.' });

  } catch (err) {
    console.error(err);
    // Handle race condition where email was already taken after the initial check
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({ msg: 'This email is already registered.' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: `This email ${email} is not registered!` });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ msg: 'Please verify your email before logging in. Check your inbox for the verification link.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Wrong Password!' });
    }

    // Generate token
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via email
    const htmlContent = `
      <html>
        <body>
          <div style="max-width: 500px; background: #fff; padding: 20px;">
            <h2 style="color: #e50914;">Reset your password</h2>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This code expires in 10 minutes.</p>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        </body>
      </html>
    `;
    await sendEmail(email, 'Password Reset OTP', htmlContent);
    res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/auth/reset-password-otp
 const resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  try {
    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired OTP' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update module.exports
module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPasswordWithOtp,
};