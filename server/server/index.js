const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // don't count successful requests
  message: { msg: 'Too many requests from this IP, please try again later.' },
});

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://flickhub-one.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  app.use(express.json()) //allow json data 
  // Routes
const authRoutes = require('../routes/auth.js');
const userRoutes = require('../routes/user.js');
const movieRoutes = require('../routes/movies.js');
const reviewsRoutes = require('../routes/reviews.js');
const adminRoutes = require('../routes/admin.js');
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/movies', reviewsRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password-otp', authLimiter);

app.get('/', (req, res) => {
  res.send('FlickHub backend running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


