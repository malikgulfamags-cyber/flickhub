import { useNavigate } from 'react-router-dom';

function DetailedMovieCard({ movie, genreMap }) {
  const navigate = useNavigate();

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const genres = movie.genre_ids
    ? movie.genre_ids.map((id) => genreMap?.[id]).filter(Boolean)
    : [];

  const rating = movie.vote_average?.toFixed(1) || '?';

  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer bg-[#111118] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-red-500/25 font-dm flex flex-col"
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      {/* Poster wrapper */}
      <div className="relative w-full h-[240px] overflow-hidden bg-[#1a1a24] flex-shrink-0">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover transition duration-300 group-hover:brightness-75"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a24] text-white/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-md bg-black/70 z-10">
          <span className="text-yellow-500">★</span>
          <span className="text-white">{rating}</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info section */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          {movie.release_date && (
            <span className="text-[11px] text-white/35">
              {movie.release_date.slice(0, 4)}
            </span>
          )}
          {genres.length > 0 && (
            <>
              <div className="w-0.5 h-0.5 rounded-full bg-white/15" />
              <span className="text-[10px] text-red-500/65 tracking-wide">
                {genres[0]}
              </span>
            </>
          )}
        </div>

        {movie.overview && (
          <p className="text-xs font-light text-white/45 leading-relaxed line-clamp-3">
            {movie.overview}
          </p>
        )}

        <button
          className="flex items-center justify-center gap-1.5 bg-red-600 text-white border-none rounded-md py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-red-700 hover:-translate-y-0.5 mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          View Details
        </button>
      </div>
    </div>
  );
}

export default DetailedMovieCard;



