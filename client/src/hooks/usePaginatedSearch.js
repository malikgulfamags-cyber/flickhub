import { useState, useEffect, useCallback, useRef } from 'react';
import { searchMovies } from '../utils/api';

export function usePaginatedSearch(query) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const reset = useCallback(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, []);

  const loadInitial = useCallback(async () => {
    if (!query.trim()) {
      setMovies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchMovies(query, 1);
      setMovies(data);
      setPage(1);
      setHasMore(data.length === 20);
    } catch (error) {
      console.error('Failed to load search results:', error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newMovies = await searchMovies(query, nextPage);
      if (newMovies.length > 0) {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(nextPage);
        if (newMovies.length < 20) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more search results:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [query, page, loadingMore, hasMore, loading]);

  // Reload when query changes
  useEffect(() => {
    reset();
    loadInitial();
  }, [query, reset, loadInitial]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, hasMore, loadMore]);

  return { movies, loading, loadingMore, hasMore, loaderRef };
}