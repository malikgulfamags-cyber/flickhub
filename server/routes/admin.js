const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getFeatured,
  addFeatured,
  removeFeatured,
  isAdmin,
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSettings,
  updateSettings,
  getLogs,
} = require('../controllers/admin.controller');

// Public route to get featured movie IDs (no auth required)
router.get('/featured-public', async (req, res) => {
  try {
    const Featured = require('../models/Featured');
    const featured = await Featured.findOne();
    res.json(featured ? featured.movieIds : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// All admin routes require authentication and admin role
router.use(auth);
router.use(isAdmin);

// Featured movies management
router.get('/featured', getFeatured);
router.post('/featured', addFeatured);
router.delete('/featured', removeFeatured);

// New admin routes
router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/logs', getLogs);

module.exports = router;