import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import { fetchMovieDetails, fetchReviews, addReview, toggleFavorite, toggleWatchlist, fetchFeaturedIds, addFeaturedMovie, removeFeaturedMovie, fetchProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const detailStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { box-sizing: border-box; }

  .md-page {
    min-height: 100vh;
    background: #07070f;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    position: relative;
  }

  /* ── Backdrop ── */
  .md-backdrop {
    position: fixed;
    inset: 0;
    z-index: 0;
  }
  .md-backdrop img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    filter: brightness(0.22) saturate(0.8);
  }
  .md-backdrop-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(7,7,15,0.3) 0%, rgba(7,7,15,0.7) 40%, #07070f 75%);
  }

  .md-body {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 5% 80px;
  }

  /* ── Hero section ── */
  .md-hero {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 48px;
    padding-top: 60px;
    align-items: start;
  }

  /* Poster */
  .md-poster-col { position: relative; }
  .md-poster-wrap {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.08);
    aspect-ratio: 2/3;
    background: #1a1a24;
  }
  .md-poster-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* FIXED: Column layout for poster actions */
  .md-poster-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
  }
  .md-actions-row {
    display: flex;
    gap: 8px;
  }
  .md-action-btn {
    flex: 1;
    height: 40px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.6);
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.2px;
  }
  .md-action-btn:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2); }
  .md-action-btn.active-fav { background: rgba(229,57,53,0.15); border-color: rgba(229,57,53,0.4); color: #ef9a9a; }
  .md-action-btn.active-fav:hover { background: rgba(229,57,53,0.25); }
  .md-action-btn.active-wl { background: rgba(33,150,243,0.12); border-color: rgba(33,150,243,0.35); color: #90caf9; }
  .md-action-btn.active-wl:hover { background: rgba(33,150,243,0.2); }
  .md-action-btn.active-featured {
    background: rgba(229,57,53,0.2);
    border-color: rgba(229,57,53,0.5);
    color: #ef9a9a;
  }

  /* Details col */
  .md-details-col { padding-top: 8px; }

  .md-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(229,57,53,0.12);
    border: 1px solid rgba(229,57,53,0.3);
    color: rgba(229,57,53,0.8);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 4px 11px;
    border-radius: 4px;
    margin-bottom: 18px;
  }

  .md-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.8rem, 5vw, 4.5rem);
    letter-spacing: 1px;
    line-height: 0.95;
    color: #fff;
    margin: 0 0 10px;
  }

  .md-tagline {
    font-size: 15px;
    font-style: italic;
    font-weight: 300;
    color: rgba(255,255,255,0.4);
    margin: 0 0 22px;
    letter-spacing: 0.2px;
  }

  .md-meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }
  .md-meta-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 5px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 12px;
    color: rgba(255,255,255,0.6);
    font-weight: 300;
  }
  .md-rating-chip {
    background: rgba(245,197,24,0.1);
    border-color: rgba(245,197,24,0.25);
    color: #f5c518;
    font-weight: 500;
  }
  .md-genre-chip {
    background: rgba(229,57,53,0.08);
    border-color: rgba(229,57,53,0.2);
    color: rgba(229,57,53,0.7);
  }

  .md-overview {
    font-size: 15px;
    font-weight: 300;
    line-height: 1.75;
    color: rgba(255,255,255,0.65);
    margin-bottom: 32px;
    max-width: 600px;
  }

  .md-primary-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #e53935;
    color: #fff;
    border: none;
    border-radius: 9px;
    padding: 13px 28px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.3px;
  }
  .md-primary-btn:hover {
    background: #c62828;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(229,57,53,0.4);
  }

  /* ── Section header ── */
  .md-section {
    margin-top: 64px;
  }
  .md-section-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .md-section-bar { width: 3px; height: 24px; background: #e53935; border-radius: 2px; }
  .md-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: #fff;
    margin: 0;
  }

  /* ── Trailer ── */
  .md-trailer-frame {
    width: 100%;
    aspect-ratio: 16/9;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    background: #111118;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }
  .md-trailer-frame iframe { width: 100%; height: 100%; border: none; display: block; }
  .md-no-trailer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px;
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 14px;
    color: rgba(255,255,255,0.2);
    font-size: 14px;
    font-weight: 300;
  }

  /* ── Reviews ── */
  .md-review-form {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 32px;
  }
  .md-form-label {
    display: block;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 8px;
    font-weight: 400;
  }
  .md-rating-select {
    width: 100%;
    height: 42px;
    padding: 0 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    cursor: pointer;
    margin-bottom: 16px;
    transition: border-color 0.2s;
  }
  .md-rating-select:focus { border-color: rgba(229,57,53,0.5); }
  option { background: #1a1a24; }
  .md-textarea {
    width: 100%;
    padding: 12px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    outline: none;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s;
    caret-color: #e53935;
    margin-bottom: 16px;
  }
  .md-textarea::placeholder { color: rgba(255,255,255,0.2); }
  .md-textarea:focus { border-color: rgba(229,57,53,0.45); background: rgba(255,255,255,0.08); }
  .md-review-error {
    font-size: 13px;
    color: #ef9a9a;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .md-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #e53935;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 22px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    letter-spacing: 0.3px;
  }
  .md-submit-btn:hover { background: #c62828; transform: translateY(-1px); }

  .md-login-prompt {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: rgba(255,255,255,0.03);
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 10px;
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 32px;
  }
  .md-login-link {
    color: #e53935;
    cursor: pointer;
    text-decoration: none;
    font-weight: 500;
    background: none;
    border: none;
    padding: 0;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: color 0.2s;
  }
  .md-login-link:hover { color: #ef5350; }

  /* Review cards */
  .md-reviews-list { display: flex; flex-direction: column; gap: 14px; }
  .md-review-card {
    padding: 20px 22px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    transition: border-color 0.2s;
  }
  .md-review-card:hover { border-color: rgba(255,255,255,0.12); }
  .md-review-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .md-reviewer {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .md-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e53935, #9c27b0);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    flex-shrink: 0;
  }
  .md-reviewer-name { font-size: 14px; font-weight: 500; color: #fff; }
  .md-reviewer-date { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 300; margin-top: 1px; }
  .md-review-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    color: #f5c518;
    background: rgba(245,197,24,0.1);
    border: 1px solid rgba(245,197,24,0.2);
    padding: 4px 10px;
    border-radius: 5px;
  }
  .md-review-comment { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.7; }
  .md-no-reviews {
    text-align: center;
    padding: 48px 0;
    font-size: 14px;
    color: rgba(255,255,255,0.2);
    font-weight: 300;
    border: 1px dashed rgba(255,255,255,0.07);
    border-radius: 12px;
  }

  /* ── Loading screen ── */
  .md-loading {
    min-height: 100vh;
    background: #07070f;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
    font-family: 'DM Sans', sans-serif;
  }
  .md-loading-reel {
    display: flex;
    gap: 3px;
  }
  .md-reel-frame {
    width: 14px;
    height: 20px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    animation: reelPulse 1.2s ease infinite;
  }
  .md-reel-frame:nth-child(1) { animation-delay: 0s; }
  .md-reel-frame:nth-child(2) { animation-delay: 0.1s; }
  .md-reel-frame:nth-child(3) { animation-delay: 0.2s; }
  .md-reel-frame:nth-child(4) { animation-delay: 0.3s; }
  .md-reel-frame:nth-child(5) { animation-delay: 0.4s; }
  .md-reel-frame:nth-child(6) { animation-delay: 0.5s; }
  @keyframes reelPulse {
    0%, 100% { background: rgba(255,255,255,0.06); transform: scaleY(1); }
    50% { background: rgba(229,57,53,0.4); transform: scaleY(1.4); }
  }
  .md-loading-text {
    font-size: 13px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .md-hero { grid-template-columns: 1fr; gap: 24px; padding-top: 40px; }
    .md-poster-wrap { max-width: 220px; margin: 0 auto; }
    .md-poster-actions { max-width: 220px; margin: 12px auto 0; }
    .md-details-col { padding-top: 0; }
    .md-title { font-size: 2.5rem; }
    .md-section { margin-top: 48px; }
  }
`;

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, token, logout } = useAuth();

  const [movie, setMovie] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(7);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!authUser);
  const [isAdmin, setIsAdmin] = useState(authUser?.role === 'admin');
  const [isFeatured, setIsFeatured] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch movie data, reviews, favorites/watchlist status
   useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tmdbMovie = await fetchMovieDetails(id);
        setMovie(tmdbMovie);
        if (tmdbMovie.videos?.results) {
          const t = tmdbMovie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
          setTrailer(t?.key || null);
        }
        const reviewsData = await fetchReviews(id);
        setReviews(reviewsData);

        if (token) {
          const profile = await fetchProfile(token);
          setIsFavorite(profile.favorites?.includes(Number(id)) || false);
          setIsWatchlist(profile.watchlist?.includes(Number(id)) || false);
        }
      } catch (err) {
        console.error(err);
        
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  // Featured status
  useEffect(() => {
    if (isAdmin) {
      const loadFeaturedStatus = async () => {
        try {
          const ids = await fetchFeaturedIds();
          setIsFeatured(ids.includes(String(id)));
        } catch (err) {
          console.error(err);
        }
      };
      loadFeaturedStatus();
    }
  }, [id, isAdmin]);

  const handleToggleFavorite = async () => {
    if (!token) {
      navigate('/api/auth/login');
      return;
    }
    try {
      await toggleFavorite(Number(id), token);
      setIsFavorite(v => !v);
      toast.success(isFavorite 
        ? 
        'Removed from favorites'
         : 
         'Added to favorites');
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!token) {
      navigate('/api/auth/login');
      return;
    }
    try {
      await toggleWatchlist(Number(id), token);
      setIsWatchlist(v => !v);
      toast.success(isWatchlist 
        ? 
        'Removed from Watchlist' 
        : 
        'Added to Watchlist');
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleToggleFeatured = async () => {
    if (!token || !isAdmin) return;
    try {
      if (isFeatured) {
        await removeFeaturedMovie(String(id), token);
      } else {
        await addFeaturedMovie(String(id), token);
      }
      setIsFeatured(!isFeatured);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!token) {
      navigate('/api/auth/login');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Comment is required');
      return;
    }
    try {
      const data = await addReview(Number(id), rating, comment, token);
      setReviews([data, ...reviews]);
      setComment('');
      setRating(7);
      toast.success('Review posted!');
    } catch (err) {
      setReviewError(err.message);
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <>
        <style>{detailStyles}</style>
        <div className="md-loading">
          <div className="md-loading-reel">
            {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="md-reel-frame" />)}
          </div>
          <div className="md-loading-text">Loading</div>
        </div>
      </>
    );
  }
  if (loading) return <Loading />;

  if (!movie) {
    return (
      <>
        <style>{detailStyles}</style>
        <div className="md-loading">
          <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)' }}>Movie not found.</div>
        </div>
      </>
    );
  }

  const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const backdrop = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;
  const genres = movie.genres?.map(g => g.name) || [];
  
  if (!movie) return <NotFound />;

  return (
    <>
     <SEO
      title={movie.title}
      description={movie.overview?.slice(0, 160)}
      image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
    />
      <style>{detailStyles}</style>
      <div className="md-page">
        {backdrop && (
          <div className="md-backdrop">
            <img src={backdrop} alt="" />
            <div className="md-backdrop-fade" />
          </div>
        )}

        <div className="md-body">
          <div className="md-hero">
            <div className="md-poster-col">
              <div className="md-poster-wrap">
                {poster
                  ? <img src={poster} alt={movie.title} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a24' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                      </svg>
                    </div>
                }
              </div>
              {isLoggedIn && (
                <div className="md-poster-actions">
                  <div className="md-actions-row">
                    <button
                      className={`md-action-btn${isFavorite ? ' active-fav' : ''}`}
                      onClick={handleToggleFavorite}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {isFavorite ? 'Saved' : 'Favorite'}
                    </button>
                    <button
                      className={`md-action-btn${isWatchlist ? ' active-wl' : ''}`}
                      onClick={handleToggleWatchlist}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {isWatchlist ? 'Watchlisted' : 'Watchlist'}
                    </button>
                  </div>
                  {isAdmin && (
                    <button
                      className={`md-action-btn p-3${isFeatured ? ' active-featured' : ''}`}
                      onClick={handleToggleFeatured}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isFeatured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {isFeatured ? 'Featured' : 'Add to Featured'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="md-details-col">
              <div className="md-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {genres[0] || 'Movie'}
              </div>

              <h1 className="md-title">{movie.title}</h1>
              {movie.tagline && <p className="md-tagline">"{movie.tagline}"</p>}

              <div className="md-meta-row">
                <div className="md-meta-chip md-rating-chip">
                  <span style={{ fontSize: '13px' }}>★</span>
                  {movie.vote_average?.toFixed(1)}/10
                </div>
                {movie.release_date && (
                  <div className="md-meta-chip">{movie.release_date.slice(0, 4)}</div>
                )}
                {movie.runtime > 0 && (
                  <div className="md-meta-chip">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    {movie.runtime} min
                  </div>
                )}
                {genres.slice(1).map(g => (
                  <div key={g} className="md-meta-chip md-genre-chip">{g}</div>
                ))}
              </div>

              <p className="md-overview">{movie.overview}</p>
            </div>
          </div>

          {/* Trailer section */}
          <div className="md-section">
            <div className="md-section-head">
              <div className="md-section-bar" />
              <h2 className="md-section-title">Official Trailer</h2>
            </div>
            {trailer ? (
              <div className="md-trailer-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer}`}
                  title="Movie Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="md-no-trailer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                No official trailer available
              </div>
            )}
          </div>

          {/* Reviews section */}
          <div className="md-section">
            <div className="md-section-head">
              <div className="md-section-bar" />
              <h2 className="md-section-title">User Reviews</h2>
              {reviews.length > 0 && (
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginLeft: '4px', fontWeight: 300 }}>
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoggedIn ? (
              <form className="md-review-form" onSubmit={handleSubmitReview}>
                <label className="md-form-label">Your rating</label>
                <select
                  className="md-rating-select"
                  value={rating}
                  onChange={e => setRating(Number(e.target.value))}
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
                    <option key={n} value={n}>{n} — {n >= 9 ? 'Masterpiece' : n >= 7 ? 'Great' : n >= 5 ? 'Average' : 'Poor'}</option>
                  ))}
                </select>

                <label className="md-form-label">Your review</label>
                <textarea
                  className="md-textarea"
                  placeholder="Share your thoughts about this movie..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />

                {reviewError && (
                  <div className="md-review-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                    </svg>
                    {reviewError}
                  </div>
                )}

                <button type="submit" className="md-submit-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Post Review
                </button>
              </form>
            ) : (
              <div className="md-login-prompt">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span>
                  <button className="md-login-link" onClick={() => navigate('/api/auth/login')}>Log in</button>
                  {' '}to write a review
                </span>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="md-no-reviews">No reviews yet — be the first to share your thoughts</div>
            ) : (
              <div className="md-reviews-list">
                {reviews.map(rev => (
                  <div key={rev._id} className="md-review-card">
                    <div className="md-review-top">
                      <div className="md-reviewer">
                        <div className="md-avatar">
                          {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="md-reviewer-name">{rev.user?.name || 'Anonymous'}</div>
                          <div className="md-reviewer-date">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="md-review-rating">
                        <span>★</span> {rev.rating}/10
                      </div>
                    </div>
                    <p className="md-review-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default MovieDetail;