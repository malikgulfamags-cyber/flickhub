import MovieListPage from '../MovieListPage';
import { fetchUpcomingMovies } from '../../utils/api';

function UpcomingPage() {
  return <MovieListPage fetchMovies={fetchUpcomingMovies} title="Upcoming Movies" />;
}

export default UpcomingPage;