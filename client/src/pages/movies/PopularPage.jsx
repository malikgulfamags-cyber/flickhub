import MovieListPage from '../MovieListPage';
import { fetchPopularMovies } from '../../utils/api';

function PopularPage() {
  return <MovieListPage fetchMovies={fetchPopularMovies} title="Popular Movies" />;
}

export default PopularPage;