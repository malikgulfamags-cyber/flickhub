import { useNavigate } from 'react-router-dom';

function MovieCard({ movie }) {
  const navigate = useNavigate();

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const year = movie.release_date?.slice(0, 4) || 'N/A';
  const rating = movie.vote_average?.toFixed(1) || '?';
  const ratingColor = rating >= 7 ? '#4caf50' : rating >= 5 ? '#f5c518' : '#e53935';

  return (
    <div
      className="group relative w-[150px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-[#111118] border border-white/5 transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:shadow-2xl hover:border-red-500/30"
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="relative w-full h-[210px] overflow-hidden bg-[#1a1a24]">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover transition duration-300 group-hover:brightness-75"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg
              className="w-9 h-9 opacity-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span className="text-xs text-white/20">No poster</span>
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-md bg-black/70 z-10">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: ratingColor }}
          />
          <span className="text-white">{rating}</span>
        </div>

        {/* Hover overlay with button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-3 z-20 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center">
          <button className="flex items-center gap-1.5 bg-red-600 text-white border-none rounded-md px-4 py-1.5 text-xs font-medium cursor-pointer hover:bg-red-700">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Details
          </button>
        </div>
      </div>

      <div className="p-2.5">
        <div className="text-sm font-medium text-white truncate">
          {movie.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-white/35">{year}</span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;