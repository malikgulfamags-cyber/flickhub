const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: { 
    type: String 
  },
  verificationTokenExpire: { 
    type: Date 
  },
  resetOtp: { type: String },
  resetOtpExpire: { type: Date },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  role: { 
    type: String, 
    default: 'user', 
  },
  favorites: [{
    type: Number   // TMDB movie IDs save honge yahan
  }],
  watchlist: [{
    type: Number   // TMDB movie IDs save honge yahan
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);