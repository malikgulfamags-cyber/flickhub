const mongoose = require('mongoose');
const featuredSchema = new mongoose.Schema({
  movieIds: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Featured', featuredSchema);