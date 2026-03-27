const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  carouselInterval: { type: Number, default: 6000 }, // milliseconds
  slidesCount: { type: Number, default: 6 },
  updatedAt: { type: Date, default: Date.now }
});

// Singleton pattern: ensure only one document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ carouselInterval: 6000, slidesCount: 6 });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);