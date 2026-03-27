// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login ,forgotPassword, resetPasswordWithOtp, verifyEmail } = require('../controllers/auth.controller.js');

const { body, validationResult } = require('express-validator');

// Validation rules for registration
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
];

// Middleware to check validation result
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }
  next();
};

// Use in route
router.post('/register', validateRegister, checkValidation, register);

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];


router.post('/login', validateLogin , checkValidation, login);

const validateForgot = [
  body('email').isEmail().normalizeEmail(),
];

router.post('/forgot-password', validateForgot, checkValidation, forgotPassword);

const validateReset = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword').isLength({ min: 6 }),
];

router.post('/reset-password-otp', validateReset, checkValidation, resetPasswordWithOtp);


router.get('/verify-email/:token', verifyEmail);

// Add Token Verification Endpoint)
router.get('/verify', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;