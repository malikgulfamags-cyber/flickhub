import MovieListPage from '../MovieListPage';
import { fetchTrendingMovies } from '../../utils/api';

function TrendingPage() {
  return <MovieListPage fetchMovies={fetchTrendingMovies} title="Trending Movies" />;
}

export default TrendingPage;