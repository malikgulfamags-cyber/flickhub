const Featured = require('../models/Featured');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Log = require('../models/Log.js');

// Get featured movies (list of TMDB IDs)
const getFeatured = async (req, res) => {
  try {
    let featured = await Featured.findOne();
    if (!featured) {
      featured = new Featured({ movieIds: [] });
      await featured.save();
    }
    res.json(featured.movieIds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add a featured movie (TMDB ID)
const addFeatured = async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ msg: 'Movie ID is required' });

    let featured = await Featured.findOne();
    if (!featured) {
      featured = new Featured({ movieIds: [] });
    }

    // Avoid duplicates
    if (!featured.movieIds.includes(movieId)) {
      featured.movieIds.push(movieId);
      featured.updatedAt = Date.now();
      await featured.save();
      await createLog(req.user.id, 'ADD_FEATURED', { movieId });
    }
    res.json(featured.movieIds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Remove a featured movie
const removeFeatured = async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ msg: 'Movie ID is required' });

    let featured = await Featured.findOne();
    if (featured) {
      featured.movieIds = featured.movieIds.filter(id => id !== movieId);
      featured.updatedAt = Date.now();
      await featured.save();
      await createLog(req.user.id, 'REMOVE_FEATURED', { movieId });
    }
    res.json(featured ? featured.movieIds : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Optional: Check if a user is admin (middleware)
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get stats (total users, admins, featured count)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const featured = await Featured.findOne();
    const featuredCount = featured ? featured.movieIds.length : 0;
    res.json({ totalUsers, totalAdmins, featuredCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.role = role;
    await user.save();
    await createLog(req.user.id, 'UPDATE_USER_ROLE', { userId, oldRole, newRole: role });
    res.json({ msg: 'Role updated', user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
     await createLog(req.user.id, 'DELETE_USER', { userId: id });
    res.json({ msg: 'User deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { key, value } = req.body;
    let settings = await Settings.getSettings();
    if (key && value !== undefined) {
      settings[key] = value;
      settings.updatedAt = Date.now();
      await settings.save();
      await createLog(req.user.id, 'UPDATE_SETTINGS', { key, value });
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate('adminId', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

const createLog = async (adminId, action, details = {}) => {
  try {
    const log = new Log({ adminId, action, details });
    await log.save();
  } catch (err) {
    console.error('Failed to save log', err);
  }
};

// Update module.exports
module.exports = {
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
  createLog,
  getLogs,
};