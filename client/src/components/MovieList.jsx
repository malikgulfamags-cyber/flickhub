import MovieCard from './MovieCard';

function MovieList({ title, movies }) {
  return (
    <div className="p-8">
      <h2 className="text-white text-3xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default MovieList;