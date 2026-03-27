import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, fetchMoviesBatch } from '../utils/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const profileStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .pf-page {
    min-height: 100vh;
    background: #07070f;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
    padding-bottom: 80px;
  }

  /* Hero banner */
  .pf-hero {
    position: relative;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a0a0a 100%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 52px 6% 40px;
    overflow: hidden;
  }
  .pf-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(229,57,53,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .pf-hero-inner {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 28px;
  }
  .pf-avatar {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e53935, #7b1fa2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 30px;
    letter-spacing: 1px;
    color: #fff;
    flex-shrink: 0;
    border: 2px solid rgba(229,57,53,0.3);
    box-shadow: 0 0 30px rgba(229,57,53,0.2);
  }
  .pf-hero-text {}
  .pf-eyebrow {
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(229,57,53,0.6);
    margin-bottom: 4px;
  }
  .pf-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: 2px;
    color: #fff;
    margin: 0 0 4px;
    line-height: 1;
  }
  .pf-email {
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    font-weight: 300;
  }

  .pf-stats {
    margin-left: auto;
    display: flex;
    gap: 20px;
  }
  .pf-stat {
    text-align: center;
    padding: 12px 18px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
  }
  .pf-stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 1px;
    color: #e53935;
    line-height: 1;
  }
  .pf-stat-label {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    margin-top: 3px;
  }

  /* Body */
  .pf-body {
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 5%;
  }

  /* Section */
  .pf-section { margin-top: 52px; }
  .pf-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  .pf-section-left { display: flex; align-items: center; gap: 12px; }
  .pf-section-bar { width: 3px; height: 24px; background: #e53935; border-radius: 2px; }
  .pf-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: #fff;
    margin: 0;
  }
  .pf-section-count {
    font-size: 12px;
    color: rgba(255,255,255,0.2);
    font-weight: 300;
  }

  /* Grid */
  .pf-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  /* Empty state */
  .pf-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 0;
    border: 1px dashed rgba(255,255,255,0.07);
    border-radius: 12px;
    text-align: center;
  }
  .pf-empty-icon {
    width: 48px; height: 48px;
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .pf-empty-title { font-size: 15px; font-weight: 400; color: rgba(255,255,255,0.4); }
  .pf-empty-sub { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.2); }

  /* Footer action */
  .pf-footer { margin-top: 60px; display: flex; justify-content: center; }
  .pf-home-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 9px;
    padding: 12px 28px;
    font-size: 13px;
    font-weight: 400;
    font-family: 'DM Sans', sans-serif;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
  }
  .pf-home-btn:hover { background: rgba(255,255,255,0.09); color: #fff; border-color: rgba(255,255,255,0.2); }

  /* Loading */
  .pf-loading {
    min-height: 100vh;
    background: #07070f;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
    font-family: 'DM Sans', sans-serif;
  }
  .pf-loading-reel { display: flex; gap: 3px; }
  .pf-reel-frame {
    width: 14px; height: 20px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    animation: pfReelPulse 1.2s ease infinite;
  }
  .pf-reel-frame:nth-child(1) { animation-delay: 0s; }
  .pf-reel-frame:nth-child(2) { animation-delay: 0.1s; }
  .pf-reel-frame:nth-child(3) { animation-delay: 0.2s; }
  .pf-reel-frame:nth-child(4) { animation-delay: 0.3s; }
  .pf-reel-frame:nth-child(5) { animation-delay: 0.4s; }
  .pf-reel-frame:nth-child(6) { animation-delay: 0.5s; }
  @keyframes pfReelPulse {
    0%, 100% { background: rgba(255,255,255,0.06); transform: scaleY(1); }
    50% { background: rgba(229,57,53,0.4); transform: scaleY(1.4); }
  }
  .pf-loading-text { font-size: 12px; color: rgba(255,255,255,0.2); letter-spacing: 2px; text-transform: uppercase; }

  @media (max-width: 700px) {
    .pf-stats { display: none; }
    .pf-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
  }
`;

function Profile() {
  const { token, user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [favoritesMovies, setFavoritesMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndMovies = async () => {
      if (!token) {
        navigate('/api/auth/login');
        return;
      }
      try {
        const profileData = await fetchProfile(token);
        setUser(profileData);

        // Fetch movies for favorites and watchlist in parallel
        const [favMovies, watchMovies] = await Promise.all([
          fetchMoviesBatch(profileData.favorites),
          fetchMoviesBatch(profileData.watchlist)
        ]);

        setFavoritesMovies(favMovies.filter(Boolean));
        setWatchlistMovies(watchMovies.filter(Boolean));
      } catch (err) {
        console.error('Profile fetch error:', err);
        toast.error('Failed to load profile. Please try again.');
        if (err.message.includes('authorization') || err.message.includes('token')) {
          logout();
          navigate('/api/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndMovies();
  }, [token, navigate, logout]);

  if (loading) {
    return (
      <>
      <SEO title="Profile" description="View your favorites and watchlist." />
        <style>{profileStyles}</style>
        <div className="pf-loading">
          <div className="pf-loading-reel">
            {[0,1,2,3,4,5].map(i => <div key={i} className="pf-reel-frame" />)}
          </div>
          <div className="pf-loading-text">Loading profile</div>
        </div>
      </>
    );
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <style>{profileStyles}</style>
      <div className="pf-page">
        {/* Hero */}
        <div className="pf-hero">
          <div className="pf-hero-inner">
            <div className="pf-avatar">{initials}</div>
            <div className="pf-hero-text">
              <div className="pf-eyebrow">Member</div>
              <h1 className="pf-name">{user?.name || 'User'}</h1>
              <div className="pf-email">{user?.email}</div>
            </div>
            <div className="pf-stats">
              <div className="pf-stat">
                <div className="pf-stat-num">{favoritesMovies.length}</div>
                <div className="pf-stat-label">Favorites</div>
              </div>
              <div className="pf-stat">
                <div className="pf-stat-num">{watchlistMovies.length}</div>
                <div className="pf-stat-label">Watchlist</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pf-body">
          {/* Favorites */}
          <div className="pf-section">
            <div className="pf-section-head">
              <div className="pf-section-left">
                <div className="pf-section-bar" />
                <h2 className="pf-section-title">Favorites</h2>
                {favoritesMovies.length > 0 && (
                  <span className="pf-section-count">{favoritesMovies.length} titles</span>
                )}
              </div>
            </div>
            {favoritesMovies.length === 0 ? (
              <div className="pf-empty">
                <div className="pf-empty-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="pf-empty-title">No favorites yet</div>
                <div className="pf-empty-sub">Heart a movie on its detail page to save it here</div>
              </div>
            ) : (
              <div className="pf-grid">
                {favoritesMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
              </div>
            )}
          </div>

          {/* Watchlist */}
          <div className="pf-section">
            <div className="pf-section-head">
              <div className="pf-section-left">
                <div className="pf-section-bar" />
                <h2 className="pf-section-title">Watchlist</h2>
                {watchlistMovies.length > 0 && (
                  <span className="pf-section-count">{watchlistMovies.length} titles</span>
                )}
              </div>
            </div>
            {watchlistMovies.length === 0 ? (
              <div className="pf-empty">
                <div className="pf-empty-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="pf-empty-title">Watchlist is empty</div>
                <div className="pf-empty-sub">Bookmark movies to watch them later</div>
              </div>
            ) : (
              <div className="pf-grid">
                {watchlistMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
              </div>
            )}
          </div>

          <div className="pf-footer">
            <button className="pf-home-btn" onClick={() => navigate('/')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
