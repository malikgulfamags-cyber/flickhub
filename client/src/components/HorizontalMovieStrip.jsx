import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';

function HorizontalMovieStrip({ title, movies, viewMoreLink }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 480, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-0 pb-2 font-dm">
      {/* Header with title and "View all" button */}
      {title && (
        <div className="flex items-center justify-between px-[5%] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-[22px] bg-red-600 rounded-full" />
            <h2 className="font-bebas text-[22px] tracking-[2px] text-white">
              {title}
            </h2>
          </div>
          {viewMoreLink && (
            <button
              className="flex items-center gap-1 text-[11px] font-medium uppercase 
              tracking-[1.5px] 
              text-red-500/70 hover:text-red-600 transition-all hover:gap-1.5"
              onClick={() => navigate(viewMoreLink)}
            >
              View all
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Scroll container with fade edge and arrows */}
      <div className="relative px-[5%] pt-1 pb-3">
        {/* Scrollable area */}
        <div
          className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-1.5"
          ref={scrollRef}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Fade edge on the right */}
        <div className="absolute top-0 right-[calc(5%-1px)] w-[60px] h-full bg-gradient-to-r 
        from-transparent to-[#07070f] pointer-events-none" />

        {/* Left arrow */}
        <button
          className="absolute top-1/2 -translate-y-1/2 left-[calc(5%-18px)] z-10 w-9 h-9 
          bg-black/80 border border-white/10 rounded-full flex items-center justify-center 
          cursor-pointer text-white/60 backdrop-blur-sm transition-all opacity-90 hover:opacity-100 
          group-hover:opacity-100 hover:bg-red-600/60 hover:text-white hover:border-transparent"

          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          className="absolute top-1/2 -translate-y-1/2 right-[calc(5%-18px)] z-10 w-9 h-9 
          bg-black/80 border border-white/10 rounded-full flex items-center justify-center 
          cursor-pointer text-white/60 backdrop-blur-sm transition-all opacity-90 hover:opacity-100 
          group-hover:opacity-100  hover:bg-red-600/60 hover:text-white hover:border-transparent"

          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default HorizontalMovieStrip;