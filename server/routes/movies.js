const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const TMDB_API = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Validation middleware
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0].msg });
  }
  next();
};

// Popular movies
router.get('/popular', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_API}/movie/popular`, {
      params: { api_key: API_KEY, page: req.query.page || 1 }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'TMDB API error' });
  }
});

// Trending
router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_API}/trending/movie/week`, {
      params: { api_key: API_KEY }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'TMDB API error' });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const response = await axios.get(`${TMDB_API}/search/movie`, {
      params: { api_key: API_KEY, query, page }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'TMDB API error' });
  }
});

// Movie details
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_API}/movie/${req.params.id}`, {
      params: { api_key: API_KEY, append_to_response: 'videos,credits' }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ msg: 'TMDB API error' });
  }
});

// Get multiple movies by IDs (batch) with validation
router.post('/batch', [
  body('ids').isArray().withMessage('IDs must be an array'),
  body('ids.*').isInt().withMessage('Each ID must be an integer'),
], checkValidation, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.json([]);
    }

    // Fetch each movie from TMDB
    const promises = ids.map(async (id) => {
      const response = await axios.get(`${TMDB_API}/movie/${id}`, {
        params: { api_key: API_KEY }
      });
      return response.data;
    });

    const movies = await Promise.all(promises);
    res.json(movies);
  } catch (err) {
    console.error('Batch fetch error:', err);
    res.status(500).json({ msg: 'TMDB API error' });
  }
});

module.exports = router;