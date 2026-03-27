const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');

const axios = require('axios');

const Review = require('../models/Review');

// Add review (protected)
router.post('/reviews',auth, async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.id

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({ msg: 'Rating 1 se 10 ke beech honi chahiye' });
    }

    const review = new Review({
      movieId,
      userId,
      rating,
      comment
    });

    await review.save();

    // Populate user name
    await review.populate('userId', 'name');
    
    const reviewObj = review.toObject();
    reviewObj.user = reviewObj.userId;
    delete reviewObj.userId;

    res.json(reviewObj);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all reviews for a movie
router.get('/reviews/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

      const transformedReviews = reviews.map(review => ({
      ...review,
      user: review.userId,
      userId: undefined
    }));

    res.json(transformedReviews);

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;