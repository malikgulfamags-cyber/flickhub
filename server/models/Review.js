const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  comment: { type: String, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
