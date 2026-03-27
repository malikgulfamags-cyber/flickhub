const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Get user profile (favorites + watchlist)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add / remove favorite
router.post('/favorites', auth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);

    if (user.favorites.includes(movieId)) {
      user.favorites = user.favorites.filter(id => id !== movieId);
    } else {
      user.favorites.push(movieId);
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add / remove watchlist (same logic)
router.post('/watchlist', auth, async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.user.id);

    if (user.watchlist.includes(movieId)) {
      user.watchlist = user.watchlist.filter(id => id !== movieId);
    } else {
      user.watchlist.push(movieId);
    }

    await user.save();
    res.json({ watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
// Get all users (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }});


module.exports = router;