import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchFeaturedMovieIds = async () => {
  const response = await fetch(`${API_BASE}/api/admin/featured-public`);
  if (!response.ok) throw new Error('Failed to fetch featured IDs');
  const data = await response.json();
  return data; // array of TMDB IDs as strings
};

// ==================== TMDB Functions ====================
export const fetchPopularMovies = async (page = 1) => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
  const data = await response.json();
  return data.results;
};

export const fetchUpcomingMovies = async (page = 1) => {
  const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=${page}`);
  const data = await response.json();
  return data.results;
};

export const fetchTopRatedMovies = async (page = 1) => {
  const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`);
  const data = await response.json();
  return data.results;
};

export const fetchTrendingMovies = async (page = 1) => {
  const response = await axios.get(`${BASE_URL}/trending/movie/week`, {
    params: { api_key: API_KEY, page }
  });
  return response.data.results;
};

export const fetchAnimeMovies = async (page = 1) => {
  const response = await axios.get(`${BASE_URL}/discover/movie`, {
    params: {
      api_key: API_KEY,
      with_genres: 16,
      sort_by: 'popularity.desc',
      page
    }
  });
  return response.data.results;
};

export const searchMovies = async (query, page = 1) => {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: { api_key: API_KEY, query, page }
  });
  return response.data.results;
};

export const fetchMovieDetails = async (id) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}`, {
    params: {
      api_key: API_KEY,
      append_to_response: 'videos'
    }
  });
  return response.data;
};

export const fetchGenres = async () => {
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
  const data = await response.json();
  return data.genres;
};

// ==================== Backend API Functions ====================

// Helper to get token from localStorage (since api.js is outside React context)
const getToken = () => localStorage.getItem('token');

// ---------- Auth ----------
export const register = async (name, email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Registration failed');
  return data;
};

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Login failed');
  return data;
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Failed to send OTP');
  return data;
};

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const res = await fetch(`${API_BASE}/api/auth/reset-password-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Password reset failed');
  return data;
};

export const verifyEmail = async (token) => {
  const res = await fetch(`${API_BASE}/api/auth/verify-email/${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Verification failed');
  return data;
};

// ---------- User Profile ----------
export const fetchProfile = async (token) => {
  const res = await fetch(`${API_BASE}/api/user/profile`, {
    headers: { 'x-auth-token': token }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

export const toggleFavorite = async (movieId, token) => {
  const res = await fetch(`${API_BASE}/api/user/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ movieId })
  });
  if (!res.ok) throw new Error('Failed to update favorites');
  return res.json();
};

export const toggleWatchlist = async (movieId, token) => {
  const res = await fetch(`${API_BASE}/api/user/watchlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ movieId })
  });
  if (!res.ok) throw new Error('Failed to update watchlist');
  return res.json();
};

// ---------- Reviews ----------
export const fetchReviews = async (movieId) => {
  const res = await fetch(`${API_BASE}/api/movies/reviews/${movieId}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
};

export const addReview = async (movieId, rating, comment, token) => {
  const res = await fetch(`${API_BASE}/api/movies/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ movieId, rating, comment })
  });
  if (!res.ok) throw new Error('Failed to add review');
  return res.json();
};

// ---------- Admin ----------
export const fetchFeaturedIds = async () => {
  const res = await fetch(`${API_BASE}/api/admin/featured-public`);
  if (!res.ok) throw new Error('Failed to fetch featured IDs');
  return res.json();
};

export const addFeaturedMovie = async (movieId, token) => {
  const res = await fetch(`${API_BASE}/api/admin/featured`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ movieId: String(movieId) })
  });
  if (!res.ok) throw new Error('Failed to add featured');
  return res.json();
};

export const removeFeaturedMovie = async (movieId, token) => {
  const res = await fetch(`${API_BASE}/api/admin/featured`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ movieId: String(movieId) })
  });
  if (!res.ok) throw new Error('Failed to remove featured');
  return res.json();
};

export const fetchAdminStats = async (token) => {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: { 'x-auth-token': token }
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

export const fetchAllUsers = async (token) => {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { 'x-auth-token': token }
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const updateUserRole = async (userId, role, token) => {
  const res = await fetch(`${API_BASE}/api/admin/users/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ userId, role })
  });
  if (!res.ok) throw new Error('Failed to update role');
  return res.json();
};

export const deleteUser = async (userId, token) => {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'x-auth-token': token }
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
};

export const fetchSettings = async (token) => {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    headers: { 'x-auth-token': token }
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
};

export const updateSetting = async (key, value, token) => {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify({ key, value })
  });
  if (!res.ok) throw new Error('Failed to update setting');
  return res.json();
};

// ---------- Batch Fetch for Movies ----------
export const fetchMoviesByIds = async (ids) => {
  if (!ids.length) return [];
  const limitedIds = ids.slice(0, 10);
  const promises = limitedIds.map(id => fetchMovieDetails(id));
  return Promise.all(promises);
};

export const fetchMoviesBatch = async (ids) => {
  if (!ids.length) return [];
  try {
    const response = await axios.post(`${API_BASE}/api/movies/batch`, { ids });
    return response.data;
  } catch (err) {
    console.error('Batch fetch failed:', err);
    return [];
  }
};

