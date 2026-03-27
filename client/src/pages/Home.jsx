import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HorizontalMovieStrip from '../components/HorizontalMovieStrip';
import {
  fetchPopularMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
  fetchMoviesBatch,
} from '../utils/api';
import { fetchFeaturedMovieIds, fetchMoviesByIds } from '../utils/api.js';
import SEO from '../components/SEO.jsx';

/* ─── Styles ─────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  * { box-sizing: border-box; }

  body {
    background: #07070f;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    margin: 0;
  }

  /* ── Hero ── */
  .fh-hero {
    position: relative;
    width: 100%;
    height: 92vh;
    min-height: 560px;
    max-height: 820px;
    overflow: hidden;
    background: #07070f;
  }

  .fh-slides-track {
    display: flex;
    height: 100%;
    transition: transform 0.85s cubic-bezier(0.77, 0, 0.175, 1);
    will-change: transform;
  }

  .fh-slide {
    position: relative;
    min-width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .fh-slide-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    filter: brightness(0.45) saturate(1.1);
    transform: scale(1.04);
    transition: transform 6s ease;
  }
  .fh-slide.active .fh-slide-bg { transform: scale(1); }

  /* layered gradient overlay */
  .fh-slide-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to right, rgba(7,7,15,0.92) 30%, rgba(7,7,15,0.1) 70%),
      linear-gradient(to top, rgba(7,7,15,1) 0%, rgba(7,7,15,0) 50%);
  }

  .fh-slide-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0 6% 6%;
    max-width: 680px;
  }

  .fh-slide-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(229,57,53,0.15);
    border: 1px solid rgba(229,57,53,0.35);
    color: #ef9a9a;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 4px;
    margin-bottom: 18px;
    width: fit-content;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s 0.2s ease, transform 0.5s 0.2s ease;
  }
  .fh-slide.active .fh-slide-badge { opacity: 1; transform: translateY(0); }

  .fh-slide-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 7vw, 6.5rem);
    line-height: 0.95;
    letter-spacing: 1px;
    color: #fff;
    margin: 0 0 18px;
    text-shadow: 0 4px 30px rgba(0,0,0,0.6);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.55s 0.35s ease, transform 0.55s 0.35s ease;
  }
  .fh-slide.active .fh-slide-title { opacity: 1; transform: translateY(0); }

  .fh-slide-overview {
    font-size: 15px;
    font-weight: 300;
    line-height: 1.65;
    color: rgba(255,255,255,0.6);
    margin: 0 0 24px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 520px;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.5s 0.5s ease, transform 0.5s 0.5s ease;
  }
  .fh-slide.active .fh-slide-overview { opacity: 1; transform: translateY(0); }

  .fh-slide-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s 0.55s ease, transform 0.5s 0.55s ease;
  }
  .fh-slide.active .fh-slide-meta { opacity: 1; transform: translateY(0); }

  .fh-meta-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 500;
  }
  .fh-meta-star { color: #f5c518; font-size: 13px; }
  .fh-meta-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.25); }
  .fh-meta-year {
    font-size: 13px;
    color: rgba(255,255,255,0.45);
    font-weight: 300;
  }

  .fh-slide-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.5s 0.65s ease, transform 0.5s 0.65s ease;
  }
  .fh-slide.active .fh-slide-actions { opacity: 1; transform: translateY(0); }

  .fh-btn-watch {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #e53935;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 13px 28px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .fh-btn-watch:hover {
    background: #c62828;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(229,57,53,0.4);
  }
  .fh-btn-info {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 12px 22px;
    font-size: 14px;
    font-weight: 400;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: background 0.2s, color 0.2s;
    backdrop-filter: blur(8px);
  }
  .fh-btn-info:hover {
    background: rgba(255,255,255,0.14);
    color: #fff;
  }

  /* Right side thumbnail strip */
  .fh-hero-thumb-strip {
    position: absolute;
    right: 3%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 10;
  }
  .fh-thumb {
    width: 80px;
    height: 52px;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.25s ease;
    opacity: 0.4;
    flex-shrink: 0;
  }
  .fh-thumb:hover { opacity: 0.75; transform: scale(1.06); }
  .fh-thumb.active-thumb {
    border-color: #e53935;
    opacity: 1;
    box-shadow: 0 0 14px rgba(229,57,53,0.45);
  }
  .fh-thumb img { width: 100%; height: 100%; object-fit: cover; }

  /* Nav arrows */
  .fh-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;
    background: rgba(7,7,15,0.6);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
  }
  .fh-arrow:hover { background: rgba(229,57,53,0.6); border-color: rgba(229,57,53,0.6); }
  .fh-arrow-left { left: 20px; }
  .fh-arrow-right { right: 20px; }

  /* Progress dots */
  .fh-dots {
    position: absolute;
    bottom: 24px;
    left: 6%;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10;
  }
  .fh-dot-item {
    height: 3px;
    border-radius: 2px;
    background: rgba(255,255,255,0.25);
    cursor: pointer;
    transition: all 0.35s ease;
    width: 20px;
  }
  .fh-dot-item.active-dot {
    background: #e53935;
    width: 40px;
  }

  /* Progress bar */
  .fh-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: #e53935;
    transition: width 0.1s linear;
    z-index: 20;
    opacity: 0.7;
  }

  /* ── Section wrapper ── */
  .fh-home-body {
    background: #07070f;
    padding-bottom: 60px;
  }

  .fh-section {
    padding: 48px 5% 12px;
  }

  .fh-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .fh-section-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .fh-section-accent {
    width: 4px;
    height: 28px;
    background: #e53935;
    border-radius: 2px;
  }

  .fh-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 2px;
    color: #fff;
    margin: 0;
  }

  .fh-section-count {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    font-weight: 300;
    letter-spacing: 0.3px;
    margin-top: 2px;
  }

  .fh-view-more {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(229,57,53,0.8);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s, gap 0.2s;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .fh-view-more:hover { color: #e53935; gap: 8px; }

  /* Skeleton loader */
  .fh-skeleton-strip {
    display: flex;
    gap: 14px;
    padding: 0 5%;
    overflow: hidden;
  }
  .fh-skeleton-card {
    flex-shrink: 0;
    width: 150px;
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    overflow: hidden;
  }
  .fh-skeleton-poster {
    width: 100%;
    height: 210px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .fh-skeleton-line {
    margin: 10px 12px 4px;
    height: 10px;
    border-radius: 4px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .fh-skeleton-line.short { width: 60%; margin-bottom: 12px; }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .fh-hero-thumb-strip { display: none; }
    .fh-slide-content { padding: 0 5% 18%; max-width: 100%; }
    .fh-slide-overview { -webkit-line-clamp: 2; }
    .fh-arrow { display: none; }
    .fh-section { padding: 36px 4% 8px; }
    .fh-skeleton-strip { padding: 0 4%; }
  }
`;

/* ─── Skeleton Strip ─────────────────────────────────────────────────── */
function SkeletonStrip() {
  return (
    <div className="fh-skeleton-strip">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="fh-skeleton-card">
          <div className="fh-skeleton-poster" style={{ animationDelay: `${i * 0.08}s` }} />
          <div className="fh-skeleton-line" style={{ animationDelay: `${i * 0.08}s` }} />
          <div className="fh-skeleton-line short" style={{ animationDelay: `${i * 0.08}s` }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Section Wrapper ────────────────────────────────────────────────── */
function Section({ title, movies, viewMoreLink, navigate }) {
  return (
    <div className="fh-section">
      <div className="fh-section-header">
        <div className="fh-section-left">
          <div className="fh-section-accent" />
          <div>
            <h2 className="fh-section-title">{title}</h2>
            {movies.length > 0 && (
              <div className="fh-section-count">{movies.length} titles</div>
            )}
          </div>
        </div>
        <button className="fh-view-more" onClick={() => navigate(viewMoreLink)}>
          View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {movies.length === 0 ? (
        <SkeletonStrip />
      ) : (
        <HorizontalMovieStrip title="" movies={movies} viewMoreLink={viewMoreLink} />
      )}
    </div>
  );
}

/* ─── Home ───────────────────────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate();

  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const INTERVAL = 6000;

  const slides = trending.slice(0, 6);

  useEffect(() => {
  fetchPopularMovies().then(setPopular);
  fetchTrendingMovies().then(setTrending);
  fetchUpcomingMovies().then(setUpcoming);
  fetchTopRatedMovies().then(setTopRated);

  // Fetch featured movies
  const loadFeatured = async () => {
    try {
      const ids = await fetchFeaturedMovieIds();
      if (ids.length) {
        const movies = await fetchMoviesBatch(ids);
        setFeaturedMovies(movies);
      }
    } catch (err) {
      console.error('Failed to load featured movies', err);
    } finally {
      setFeaturedLoading(false);
    }
  };
   loadFeatured();
  }, []);

  const startTimer = (index) => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 100 / (INTERVAL / 100);
      if (p >= 100) p = 100;
      setProgress(p);
    }, 100);
    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, INTERVAL);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    startTimer(currentSlide);
    return () => { clearInterval(timerRef.current); clearInterval(progressRef.current); };
  }, [currentSlide, slides.length]);

  const goTo = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => goTo((currentSlide - 1 + slides.length) % slides.length);
  const nextSlide = () => goTo((currentSlide + 1) % slides.length);

  return (
    <>
    <SEO
     title="Home" 
     description="Watch trending movies, popular films, 
     top rated, upcoming releases and anime." />
    
      <style>{styles}</style>

      <div className="fh-home-body">
        {/* ── Hero Carousel ── */}
        {slides.length > 0 && (
          <div className="fh-hero">
            
              
            {/* Slides track */}
            <div
              className="fh-slides-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              
              {slides.map((movie, i) => (
                <div key={movie.id} className={`fh-slide${i === currentSlide ? ' active' : ''}`}>
                  <img
                    className="fh-slide-bg"
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                  
                  <div className="fh-slide-overlay" />
                  
                  <div className="fh-slide-content">
                    
                    <div className="fh-slide-badge">
                      
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      
                      Trending Now
                    </div>
                    
                    <h1 className="fh-slide-title">{movie.title}</h1>
                    <p className="fh-slide-overview">{movie.overview}</p>
                    <div className="fh-slide-meta">
                      <div className="fh-meta-rating">
                        <span className="fh-meta-star">★</span>
                        <span>{movie.vote_average?.toFixed(1)}</span>
                      </div>
                      <div className="fh-meta-dot" />
                      <span className="fh-meta-year">{movie.release_date?.slice(0, 4)}</span>
                    </div>
                    <div className="fh-slide-actions">
                      <button
                        className="fh-btn-watch"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        View Details
                      </button>
                      <button className="fh-btn-info" onClick={() => navigate(`/movie/${movie.id}`)}>
                        
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          
                          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        More Info
                      </button>
                      
                    </div>
                    
                  </div>
                  
                </div>
                
              ))}
              
            </div>

            {/* Thumbnail strip */}
            <div className="fh-hero-thumb-strip">
              
              {slides.map((movie, i) => (
                <div
                  key={movie.id}
                  className={`fh-thumb${i === currentSlide ? ' active-thumb' : ''}`}
                  onClick={() => goTo(i)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w300${movie.backdrop_path}`}
                    alt={movie.title}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Arrows */}
            <button className="fh-arrow fh-arrow-left" onClick={prevSlide} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="fh-arrow fh-arrow-right" onClick={nextSlide} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dots */}
            <div className="fh-dots">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`fh-dot-item${i === currentSlide ? ' active-dot' : ''}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="fh-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
        {!featuredLoading && featuredMovies.length > 0 && (
                <Section 
                  title="Featured Movies" 
                  movies={featuredMovies} 
                  viewMoreLink="/featured" // Agar aap separate page banana chahte ho, warna koi link nahi
                  navigate={navigate} 
                />
              )}

        {/* ── Movie Sections ── */}
        <Section title="Trending Now"    movies={trending}  viewMoreLink="/trending"  navigate={navigate} />
        <Section title="Popular Movies"  movies={popular}   viewMoreLink="/popular"   navigate={navigate} />
        <Section title="Top Rated"       movies={topRated}  viewMoreLink="/top-rated" navigate={navigate} />
        <Section title="Upcoming Movies" movies={upcoming}  viewMoreLink="/upcoming"  navigate={navigate} />
      </div>
    </>
  );
}

export default Home;