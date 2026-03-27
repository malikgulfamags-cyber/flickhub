import MovieListPage from '../MovieListPage';
import { fetchAnimeMovies } from '../../utils/api';

function AnimePage() {
  return <MovieListPage fetchMovies={fetchAnimeMovies} title="Anime Movies" />;
}

export default AnimePage;