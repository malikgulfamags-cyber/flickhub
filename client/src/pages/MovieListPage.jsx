import { usePaginatedMovies } from '../hooks/usePaginatedMovies';
import MovieCard from '../components/MovieCard';
import SEO from '../components/SEO';

// Styles (copy from one of the existing pages, e.g., TrendingPage)
const styles = `
  .page-wrap {
    background: #07070f;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
  }
  .page-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  .page-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 32px;
  }
  .page-accent {
    width: 4px;
    height: 32px;
    background: #e53935;
    border-radius: 2px;
  }
  .page-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    letter-spacing: 2px;
    margin: 0;
    color: #fff;
  }
  .page-count {
    font-size: 14px;
    color: rgba(255,255,255,0.3);
    margin-left: 8px;
  }
  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }
  .skeleton-card {
    border-radius: 10px;
    overflow: hidden;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .skeleton-poster { width: 100%; height: 210px; background: rgba(255,255,255,0.03); }
  .skeleton-title { height: 14px; margin: 12px 12px 8px; background: rgba(255,255,255,0.05); border-radius: 4px; }
  .skeleton-meta { height: 10px; margin: 0 12px 16px; width: 60%; background: rgba(255,255,255,0.05); border-radius: 4px; }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .loader-sentinel { height: 20px; margin: 20px 0; }
  .loading-more { text-align: center; padding: 20px; color: rgba(255,255,255,0.5); font-size: 14px; }
`;

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster" />
      <div className="skeleton-title" />
      <div className="skeleton-meta" />
    </div>
  );
}

function MovieListPage({ fetchMovies, title }) {
  const { movies, loading, loadingMore, hasMore, loaderRef } = usePaginatedMovies(fetchMovies);

  return (
    <>
    <SEO 
    title={title} 
    description={`Browse the best ${title.toLowerCase()} movies on FlickHub.`} />
    
      <style>{styles}</style>
      <div className="page-wrap">
        <div className="page-container">
          <div className="page-header">
            <div className="page-accent" />
            <h1 className="page-title">
              {title}
              {movies.length > 0 && !loading && (
                <span className="page-count">({movies.length})</span>
              )}
            </h1>
          </div>
          {loading ? (
            <div className="movies-grid">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              <div className="movies-grid">
                {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
              </div>
              {hasMore && !loadingMore && <div ref={loaderRef} className="loader-sentinel" />}
              {loadingMore && <div className="loading-more">Loading more movies...</div>}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MovieListPage;