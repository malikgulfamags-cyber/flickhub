import MovieListPage from '../MovieListPage';
import { fetchTopRatedMovies } from '../../utils/api';

function TopRatedPage() {
  return <MovieListPage fetchMovies={fetchTopRatedMovies} title="TopRated Movies" />;
}

export default TopRatedPage;