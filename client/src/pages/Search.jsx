import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMovies } from '../utils/api';
import MovieList from '../components/MovieList';
import { usePaginatedSearch } from '../hooks/usePaginatedSearch';
import SEO from '../components/SEO';

const searchStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .srch-page {
    min-height: 100vh;
    background: #07070f;
    font-family: 'DM Sans', sans-serif;
    padding: 48px 5% 80px;
  }

  /* Header area */
  .srch-header {
    margin-bottom: 48px;
  }
  .srch-eyebrow {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(229,57,53,0.7);
    margin-bottom: 10px;
  }
  .srch-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.8rem, 6vw, 5rem);
    letter-spacing: 2px;
    color: #fff;
    margin: 0 0 28px;
    line-height: 1;
  }
  .srch-heading span { color: #e53935; }

  /* Search bar */
  .srch-bar-wrap {
    position: relative;
    max-width: 600px;
  }
  .srch-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: rgba(255,255,255,0.3);
    pointer-events: none;
    transition: color 0.2s;
  }
  .srch-bar-wrap:focus-within .srch-icon { color: rgba(229,57,53,0.6); }
  .srch-input {
    width: 100%;
    height: 52px;
    padding: 0 52px 0 50px;
    border-radius: 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    color: #fff;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    outline: none;
    caret-color: #e53935;
    transition: all 0.3s ease;
  }
  .srch-input::placeholder { color: rgba(255,255,255,0.25); }
  .srch-input:focus {
    background: rgba(255,255,255,0.09);
    border-color: rgba(229,57,53,0.45);
    box-shadow: 0 0 0 3px rgba(229,57,53,0.1), 0 8px 30px rgba(0,0,0,0.4);
  }
  .srch-clear {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.08);
    border: none;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.5);
    transition: all 0.2s;
  }
  .srch-clear:hover { background: rgba(229,57,53,0.2); color: #e57373; }

  /* Stats bar */
  .srch-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    font-weight: 300;
  }
  .srch-stats-count {
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    font-size: 14px;
  }
  .srch-stats-sep { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); }

  /* Loading */
  .srch-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 20px;
  }
  .srch-spinner {
    width: 48px;
    height: 48px;
    border: 2px solid rgba(255,255,255,0.06);
    border-top-color: #e53935;
    border-radius: 50%;
    animation: srch-spin 0.8s linear infinite;
  }
  @keyframes srch-spin { to { transform: rotate(360deg); } }
  .srch-loading-text {
    font-size: 13px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
  }
  .srch-loading-query { color: rgba(229,57,53,0.6); }

  /* Error */
  .srch-error {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(229,57,53,0.08);
    border: 1px solid rgba(229,57,53,0.2);
    border-radius: 10px;
    color: #ef9a9a;
    font-size: 14px;
    max-width: 500px;
  }
  .srch-error-icon { flex-shrink: 0; color: #e53935; }

  /* Empty state */
  .srch-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 0;
    gap: 14px;
    text-align: center;
  }
  .srch-empty-icon {
    width: 56px;
    height: 56px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }
  .srch-empty-title {
    font-size: 18px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
  }
  .srch-empty-sub {
    font-size: 13px;
    font-weight: 300;
    color: rgba(255,255,255,0.25);
    max-width: 300px;
    line-height: 1.6;
  }
  .srch-empty-query { color: rgba(229,57,53,0.6); }

  /* Welcome state */
  .srch-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 0;
    gap: 16px;
    text-align: center;
  }
  .srch-welcome-ring {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 1px solid rgba(229,57,53,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    position: relative;
  }
  .srch-welcome-ring::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 50%;
    border: 1px solid rgba(229,57,53,0.1);
  }
  .srch-welcome-title {
    font-size: 17px;
    font-weight: 400;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.3px;
  }
  .srch-welcome-sub {
    font-size: 13px;
    font-weight: 300;
    color: rgba(255,255,255,0.2);
  }

  /* Divider */
  .srch-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 40px 0 32px;
  }
  .srch-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
  }
  .srch-divider-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
  }
`;

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const query = searchParams.get('q') || '';

  const { movies: results, loading, loadingMore, hasMore, loaderRef } = usePaginatedSearch(query);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    val.trim() === '' ? setSearchParams({}) : setSearchParams({ q: val });
  };

  const clearQuery = () => { setSearchParams({}); inputRef.current?.focus(); };

  return (
    <>
    <SEO
        title={query ? `Search: ${query}` : 'Search Movies'}
        description={query ? `Search results for "${query}" on FlickHub.` : 'Search for your favorite movies.'}
      />
      <style>{searchStyles}</style>
      <div className="srch-page">

        {/* Header */}
        <div className="srch-header">
          <div className="srch-eyebrow">Discover</div>
          <h1 className="srch-heading">
            {query ? (<>Results for <span>"{query}"</span></>) : 'Search Movies'}
          </h1>

          {/* Search bar */}
          <div className="srch-bar-wrap">
            <svg className="srch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="srch-input"
              placeholder="Search for a movie title..."
              value={query}
              onChange={handleInputChange}
              autoFocus
              autoComplete="off"
              spellCheck="false"
              aria-label="Search movies"
            />
            {query && (
              <button className="srch-clear" onClick={clearQuery} aria-label="Clear">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Stats */}
          {!loading && results.length > 0 && (
            <div className="srch-stats">
              <span className="srch-stats-count">{results.length} results</span>
              <div className="srch-stats-sep"/>
              <span>for "{query}"</span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="srch-loading">
            <div className="srch-spinner"/>
            <div className="srch-loading-text">
              Searching for <span className="srch-loading-query">"{query}"</span>...
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="srch-error">
            <svg className="srch-error-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            {error}
          </div>
        )}

        {/* No query */}
        {!query && !loading && (
          <div className="srch-welcome">
            <div className="srch-welcome-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(229,57,53,0.5)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="srch-welcome-title">Type to search across thousands of movies</div>
            <div className="srch-welcome-sub">Find movies by title, discover hidden gems, explore genres</div>
          </div>
        )}

        {/* Empty results */}
        {!loading && !error && query && results.length === 0 && (
          <div className="srch-empty">
            <div className="srch-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
              </svg>
            </div>
            <div className="srch-empty-title">No movies found</div>
            <div className="srch-empty-sub">
              No results for <span className="srch-empty-query">"{query}"</span>. Try a different title or check your spelling.
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <>
            <div className="srch-divider">
              <div className="srch-divider-line"/>
              <span className="srch-divider-label">{results.length} titles found</span>
              <div className="srch-divider-line"/>
            </div>
            <MovieList title="" movies={results} />
            {!loading && hasMore && !loadingMore && <div ref={loaderRef} className="h-10" />}
            {loadingMore && <div className="text-center py-4 text-gray-400">Loading more...</div>}
          </>
        )}

      </div>
    </>
  );
};

export default Search;