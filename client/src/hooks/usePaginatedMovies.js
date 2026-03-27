import { useState, useEffect, useCallback, useRef } from 'react';

export function usePaginatedMovies(fetchFunction) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFunction(1);
      setMovies(data);
      setPage(1);
      setHasMore(data.length === 20);
    } catch (error) {
      console.error('Failed to load initial movies:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const newMovies = await fetchFunction(nextPage);
      if (newMovies.length > 0) {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(nextPage);
        if (newMovies.length < 20) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more movies:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchFunction, page, loadingMore, hasMore]);

  // Initial load
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

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