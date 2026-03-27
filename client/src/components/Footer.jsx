import { useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();

  const NAV_LINKS = [
    { to: '/trending', label: 'Trending' },
    { to: '/upcoming', label: 'Upcoming' },
    { to: '/popular', label: 'Popular' },
    { to: '/top-rated', label: 'Top Rated' },
    { to: '/anime', label: 'Animated' },
  ];

  return (
    <footer className="bg-[#050509] border-t border-white/5 font-dm pt-12 pb-7 px-[6%]">
      <div className="max-w-[1180px] mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
          {/* Logo + tagline */}
          <div>
            <div
              className="flex items-center gap-2 cursor-pointer mb-3"
              onClick={() => navigate('/')}
            >
              <div className="w-[30px] h-[30px] bg-red-600 rounded-lg flex items-center justify-center transition-transform hover:rotate-[-6deg] hover:scale-105">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM13 10l-2 5 2-2.5L15 15l-2-5z"
                    fill="#fff"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-bebas text-2xl tracking-[2px] text-white">
                Flick<span className="text-red-600">Hub</span>
              </span>
            </div>
            <p className="text-xs font-light text-white/25 max-w-[220px] leading-relaxed">
              Discover, track and explore movies you love — all in one place.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex gap-12 flex-wrap">
            {/* Browse */}
            <div>
              <div className="text-[10px] tracking-[2.5px] uppercase text-white/25 mb-3.5 font-normal">
                Browse
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {NAV_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <button
                      className="bg-none border-none p-0 text-xs font-light text-white/40 cursor-pointer font-dm transition-colors hover:text-white"
                      onClick={() => navigate(to)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <div className="text-[10px] tracking-[2.5px] uppercase text-white/25 mb-3.5 font-normal">
                Account
              </div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                <li>
                  <button
                    className="bg-none border-none p-0 text-xs font-light text-white/40 cursor-pointer font-dm transition-colors hover:text-white"
                    onClick={() => navigate('/api/auth/login')}
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    className="bg-none border-none p-0 text-xs font-light 
                    text-white/40 cursor-pointer font-dm transition-colors 
                    hover:text-white"
                    onClick={() => navigate('/api/auth/register')}
                  >
                    Sign Up
                  </button>
                </li>
                <li>
                  <button
                    className="bg-none border-none p-0 text-xs font-light 
                    text-white/40 cursor-pointer font-dm transition-colors 
                    hover:text-white"
                    onClick={() => navigate('/profile')}
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    className="bg-none border-none p-0 text-xs font-light 
                    text-white/40 cursor-pointer font-dm transition-colors 
                    hover:text-white"
                    onClick={() => navigate('/api/auth/forget-password')}
                  >
                    Forgot Password
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="text-xs font-light text-white/20">
            © 2026 Flick<span className="text-red-600">Hub</span> — All Rights Reserved
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/15 font-light">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;