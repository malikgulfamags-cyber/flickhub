// components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchMovies } from "../utils/api";
import { SiAnimalplanet } from "react-icons/si";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  // { to: '/', label: 'Home' },
  { to: "/trending", label: "Trending" },
  { to: "/upcoming", label: "Upcoming" },
  { to: "/popular", label: "Popular" },
  { to: "/top-rated", label: "Top Rated" },
  { to: "/anime", label: "Animated" },
];

function Navbar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // New state for mobile inline search
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const [mobileSuggestions, setMobileSuggestions] = useState([]);
  const [mobileShowSuggestions, setMobileShowSuggestions] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileSelectedIndex, setMobileSelectedIndex] = useState(-1);


  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const debounceTimer = useRef(null);
  const mobileDebounceTimer = useRef(null);

  // Check login and admin status 
   const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  
  // Update the logout function:
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Reset drawer search when closing
      setDrawerQuery("");
      setDrawerSuggestions([]);
      setDrawerShowSuggestions(false);
      setDrawerSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // search for main desktop search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }
    setLoadingSuggestions(true);
    debounceTimer.current = setTimeout(() => {
      searchMovies(query)
        .then((results) => {
          setSuggestions(results.slice(0, 8));
          setShowSuggestions(true);
          setSelectedIndex(-1);
          setLoadingSuggestions(false);
        })
        .catch((err) => {
          console.error("Suggestion fetch failed:", err);
          setLoadingSuggestions(false);
        });
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  // search for mobile inline search
  useEffect(() => {
    if (mobileDebounceTimer.current) clearTimeout(mobileDebounceTimer.current);
    if (mobileQuery.trim().length < 2) {
      setMobileSuggestions([]);
      setMobileShowSuggestions(false);
      setMobileSelectedIndex(-1);
      return;
    }
    setMobileLoading(true);
    mobileDebounceTimer.current = setTimeout(() => {
      searchMovies(mobileQuery)
        .then((results) => {
          setMobileSuggestions(results.slice(0, 8));
          setMobileShowSuggestions(true);
          setMobileSelectedIndex(-1);
          setMobileLoading(false);
        })
        .catch((err) => {
          console.error("Mobile suggestion fetch failed:", err);
          setMobileLoading(false);
        });
    }, 300);
    return () => {
      if (mobileDebounceTimer.current)
        clearTimeout(mobileDebounceTimer.current);
    };
  }, [mobileQuery]);

  // Close suggestions on outside click (main search)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Drawer search state and handlers 
  const [drawerQuery, setDrawerQuery] = useState("");
  const [drawerSuggestions, setDrawerSuggestions] = useState([]);
  const [drawerShowSuggestions, setDrawerShowSuggestions] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerSelectedIndex, setDrawerSelectedIndex] = useState(-1);
  const drawerDebounceTimer = useRef(null);
  const drawerSearchRef = useRef(null);

  // search for drawer search
  useEffect(() => {
    if (drawerDebounceTimer.current) clearTimeout(drawerDebounceTimer.current);
    if (drawerQuery.trim().length < 2) {
      setDrawerSuggestions([]);
      setDrawerShowSuggestions(false);
      setDrawerSelectedIndex(-1);
      return;
    }
    setDrawerLoading(true);
    drawerDebounceTimer.current = setTimeout(() => {
      searchMovies(drawerQuery)
        .then((results) => {
          setDrawerSuggestions(results.slice(0, 8));
          setDrawerShowSuggestions(true);
          setDrawerSelectedIndex(-1);
          setDrawerLoading(false);
        })
        .catch((err) => {
          console.error("Drawer suggestion fetch failed:", err);
          setDrawerLoading(false);
        });
    }, 300);
    return () => {
      if (drawerDebounceTimer.current)
        clearTimeout(drawerDebounceTimer.current);
    };
  }, [drawerQuery]);

  // Drawer search handlers
  const handleDrawerInputChange = (e) => {
    setDrawerQuery(e.target.value);
    if (!drawerShowSuggestions && e.target.value.trim().length >= 2)
      setDrawerShowSuggestions(true);
  };

  const handleDrawerKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (drawerSelectedIndex >= 0 && drawerSuggestions[drawerSelectedIndex]) {
        handleDrawerSuggestionClick(drawerSuggestions[drawerSelectedIndex].id);
      } else if (drawerQuery.trim() !== "") {
        setDrawerShowSuggestions(false);
        setMobileMenuOpen(false);
        navigate(`/search?q=${encodeURIComponent(drawerQuery.trim())}`);
        setDrawerQuery("");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (drawerSuggestions.length > 0)
        setDrawerSelectedIndex((p) => (p + 1) % drawerSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (drawerSuggestions.length > 0)
        setDrawerSelectedIndex(
          (p) => (p - 1 + drawerSuggestions.length) % drawerSuggestions.length,
        );
    }
  };

  const handleDrawerSuggestionClick = (movieId) => {
    setDrawerShowSuggestions(false);
    setDrawerQuery("");
    setDrawerSelectedIndex(-1);
    setMobileMenuOpen(false);
    navigate(`/movie/${movieId}`);
  };

  const clearDrawerSearch = () => {
    setDrawerQuery("");
    setDrawerShowSuggestions(false);
    setDrawerSelectedIndex(-1);
  };

  // Mobile inline search handlers
  const handleMobileInputChange = (e) => {
    setMobileQuery(e.target.value);
    if (!mobileShowSuggestions && e.target.value.trim().length >= 2)
      setMobileShowSuggestions(true);
  };

  const handleMobileKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (mobileSelectedIndex >= 0 && mobileSuggestions[mobileSelectedIndex]) {
        handleMobileSuggestionClick(mobileSuggestions[mobileSelectedIndex].id);
      } else if (mobileQuery.trim() !== "") {
        setMobileShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(mobileQuery.trim())}`);
        setMobileQuery("");
        setMobileSearchActive(false);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (mobileSuggestions.length > 0)
        setMobileSelectedIndex((p) => (p + 1) % mobileSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (mobileSuggestions.length > 0)
        setMobileSelectedIndex(
          (p) => (p - 1 + mobileSuggestions.length) % mobileSuggestions.length,
        );
    } else if (e.key === "Escape") {
      setMobileSearchActive(false);
      setMobileQuery("");
      setMobileShowSuggestions(false);
    }
  };

  const handleMobileSuggestionClick = (movieId) => {
    setMobileShowSuggestions(false);
    setMobileQuery("");
    setMobileSelectedIndex(-1);
    setMobileSearchActive(false);
    navigate(`/movie/${movieId}`);
  };

  const clearMobileSearch = () => {
    setMobileQuery("");
    setMobileShowSuggestions(false);
    setMobileSelectedIndex(-1);
  };

  const closeMobileSearch = () => {
    setMobileSearchActive(false);
    setMobileQuery("");
    setMobileShowSuggestions(false);
    setMobileSelectedIndex(-1);
  };

  // Main search handlers
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!showSuggestions && e.target.value.trim().length >= 2)
      setShowSuggestions(true);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileSearchActive) {
        setMobileSearchActive(false);
        setMobileQuery("");
        setMobileShowSuggestions(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileSearchActive]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex].id);
      } else if (query.trim() !== "") {
        setShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setQuery("");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0)
        setSelectedIndex((p) => (p + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0)
        setSelectedIndex(
          (p) => (p - 1 + suggestions.length) % suggestions.length,
        );
    }
  };

  const handleSuggestionClick = (movieId) => {
    setShowSuggestions(false);
    setQuery("");
    setSelectedIndex(-1);
    navigate(`/movie/${movieId}`);
  };

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const goToHome = () => {
    clearSearch();
    navigate("/");
  };

  const openDrawer = () => {
    setMobileMenuOpen(true);
    setTimeout(() => {
      if (drawerSearchRef.current) drawerSearchRef.current.focus();
    }, 100);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        /* Base navbar styles (unchanged except where noted) */
        .fh-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'DM Sans', sans-serif;
        }
        .fh-nav.scrolled {
          background: rgba(5, 5, 10, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
        }
        .fh-nav.top {
          background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
        }
        .fh-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 68px;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Logo */
        .fh-logo {
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .fh-logo-icon {
          width: 32px;
          height: 32px;
          background: #e53935;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .fh-logo:hover .fh-logo-icon { transform: rotate(-6deg) scale(1.08); }
        .fh-logo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          letter-spacing: 2px;
          color: #fff;
          line-height: 1;
        }
        .fh-logo-text span { color: #e53935; }

        /* Nav Links */
        .fh-links {
          display: flex;
          align-items: center;
          gap: 0;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .fh-links a {
          display: block;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.2s ease;
          position: relative;
        }
        .fh-links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 16px;
          height: 2px;
          background: #e53935;
          border-radius: 2px;
          transition: transform 0.25s ease;
        }
        .fh-links a:hover { color: #fff; }
        .fh-links a:hover::after { transform: translateX(-50%) scaleX(1); }

        /* Search */
        .fh-search-wrap {
          flex: 1;
          max-width: 360px;
          position: relative;
          transition: all 0.3s ease;
        }
        /* Desktop expanded search */
        .fh-search-wrap.expanded {
          max-width: 480px;
        }
        .fh-search-inner {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fh-search-input {
          width: 100%;
          height: 40px;
          padding: 0 38px 0 40px;
          border-radius: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          outline: none;
          transition: all 0.3s ease;
          caret-color: #e53935;
        }
        .fh-search-input::placeholder { color: rgba(255,255,255,0.3); }
        .fh-search-input:focus {
          background: rgba(255,255,255,0.1);
          border-color: rgba(229,57,53,0.5);
          box-shadow: 0 0 0 3px rgba(229,57,53,0.12);
        }
        .fh-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          color: rgba(255,255,255,0.35);
          pointer-events: none;
          transition: color 0.2s;
        }
        .fh-clear-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .fh-clear-btn:hover { color: rgba(255,255,255,0.8); }

        /* Suggestions (shared) */
        .fh-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #13131a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7);
          animation: dropIn 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 70;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fh-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .fh-dropdown-item:last-child { border-bottom: none; }
        .fh-dropdown-item:hover,
        .fh-dropdown-item.selected { background: rgba(229,57,53,0.12); }
        .fh-dropdown-item img {
          width: 36px;
          height: 52px;
          object-fit: cover;
          border-radius: 5px;
          flex-shrink: 0;
        }
        .fh-dropdown-no-img {
          width: 36px;
          height: 52px;
          background: rgba(255,255,255,0.06);
          border-radius: 5px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(255,255,255,0.25);
        }
        .fh-movie-title {
          font-size: 13.5px;
          font-weight: 500;
          color: #fff;
          line-height: 1.3;
        }
        .fh-movie-meta {
          font-size: 11.5px;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .fh-star { color: #f5c518; font-size: 11px; }
        .fh-dropdown-empty {
          padding: 18px;
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }
        .fh-dropdown-loading {
          padding: 14px;
          display: flex;
          justify-content: center;
          gap: 5px;
        }
        .fh-dot {
          width: 5px; height: 5px;
          background: #e53935;
          border-radius: 50%;
          animation: pulse 1s ease infinite;
        }
        .fh-dot:nth-child(2) { animation-delay: 0.15s; }
        .fh-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        /* Auth Buttons */
        .fh-auth {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .fh-btn-ghost {
          background: none;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 13px;
          font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .fh-btn-ghost:hover {
          border-color: rgba(255,255,255,0.35);
          color: #fff;
          background: rgba(255,255,255,0.05);
        }
        .fh-btn-primary {
          background: #e53935;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .fh-btn-primary:hover {
          background: #c62828;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(229,57,53,0.35);
        }
        .fh-btn-primary:active { transform: translateY(0); }
        .fh-avatar-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e53935, #b71c1c);
          border: 2px solid rgba(229,57,53,0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #fff;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }
        .fh-avatar-btn:hover {
          transform: scale(1.08);
          border-color: rgba(229,57,53,0.8);
          box-shadow: 0 0 14px rgba(229,57,53,0.35);
        }

        /* Admin button */
        .fh-btn-admin {
          background: rgba(229,57,53,0.15);
          border: 1px solid rgba(229,57,53,0.5);
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          color: #e57373;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
          font-family: 'DM Sans', sans-serif;
        }
        .fh-btn-admin:hover {
          background: rgba(229,57,53,0.25);
          border-color: #e53935;
          color: #fff;
        }

        /* Hamburger */
        .fh-hamburger {
          display: none;
          background: none;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          transition: border-color 0.2s;
        }
        .fh-hamburger:hover { border-color: rgba(255,255,255,0.3); }
        .fh-bar {
          width: 18px;
          height: 1.5px;
          background: rgba(255,255,255,0.7);
          border-radius: 2px;
          transition: all 0.25s ease;
          transform-origin: center;
        }
        .fh-hamburger.open .fh-bar:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .fh-hamburger.open .fh-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .fh-hamburger.open .fh-bar:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile search icon (only visible on small screens) */
        .fh-mobile-search-icon {
          display: none;
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          padding: 6px;
          margin-right: 4px;
          transition: color 0.2s;
        }
        .fh-mobile-search-icon:hover { color: #fff; }

        /* Mobile inline search container */
        .fh-mobile-search-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .fh-mobile-search-input {
          flex: 1;
          height: 40px;
          padding: 0 38px 0 40px;
          border-radius: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        .fh-mobile-search-input:focus {
          border-color: rgba(229,57,53,0.5);
        }
        .fh-mobile-close-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Drawer overlay and panel (unchanged) */
        .fh-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 60;
          transition: opacity 0.3s ease;
          opacity: 0;
          visibility: hidden;
        }
        .fh-drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }
        .fh-drawer {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: #0f0f17;
          border-right: 1px solid rgba(255,255,255,0.08);
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 61;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .fh-drawer.open {
          transform: translateX(0);
        }
        .fh-drawer-header {
          padding: 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .fh-drawer-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fh-drawer-close:hover { color: #fff; }
        .fh-drawer-search {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }
        .fh-drawer-search-input {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        .fh-drawer-search-input:focus {
          border-color: rgba(229,57,53,0.5);
        }
        .fh-drawer-suggestions {
          margin-top: 8px;
          background: #1a1a24;
          border-radius: 10px;
          overflow: hidden;
          max-height: 300px;
          overflow-y: auto;
        }
        .fh-drawer-nav {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fh-drawer-nav a, .fh-drawer-nav button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: background 0.2s;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .fh-drawer-nav a:hover, .fh-drawer-nav button:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .fh-drawer-nav svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          fill: none;
          stroke-width: 1.5;
        }
        .fh-drawer-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 8px 0;
        }

        /* Responsive breakpoints */
        @media (max-width: 900px) {
          .fh-links { display: none; }
          .fh-hamburger { display: flex; }
        }
        @media (max-width: 768px) {
          .fh-search-wrap { display: none; }
          .fh-mobile-search-icon { display: inline-flex; }
          .fh-inner { gap: 0.75rem; }
          .fh-auth { gap: 6px; }
          .fh-btn-ghost { padding: 6px 12px; font-size: 12px; }
          .fh-btn-primary { padding: 6px 14px; font-size: 12px; }
          .fh-avatar-btn { width: 30px; height: 30px; font-size: 12px; }
          /* When mobile search is active, hide other items */
          .fh-inner.mobile-search-active .fh-logo,
          .fh-inner.mobile-search-active .fh-auth,
          .fh-inner.mobile-search-active .fh-hamburger,
          .fh-inner.mobile-search-active .fh-mobile-search-icon {
            display: none;
          }
          .fh-inner.mobile-search-active .fh-mobile-search-container {
            display: flex;
          }
          .fh-mobile-search-container {
            display: none;
          }
        }
        @media (max-width: 480px) {
          .fh-inner { padding: 0 1rem; }
          .fh-logo-text { font-size: 22px; }
          .fh-btn-ghost { display: none; }
          .fh-btn-primary { padding: 5px 12px; }
        }
          /* Default: hidden */
.fh-mobile-search-container {
  display: none;
}

@media (max-width: 768px) {
  /* When search is active, hide normal navbar elements and show the search container */
  .fh-inner.mobile-search-active .fh-logo,
  .fh-inner.mobile-search-active .fh-auth,
  .fh-inner.mobile-search-active .fh-hamburger,
  .fh-inner.mobile-search-active .fh-mobile-search-icon {
    display: none;
  }
  .fh-inner.mobile-search-active .fh-mobile-search-container {
    display: flex;
    width: 100%;
  }
}
  /* Optional: adjust logo in mobile search container */
.fh-mobile-logo .fh-logo-text {
  font-size: 20px;
  
}
.fh-mobile-logo .fh-logo-icon {
  width: 28px;
  height: 28px;
  
}
  /* Mobile logo styles */
.fh-mobile-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex-shrink: 0;      /* Prevent the logo from shrinking */
}
.fh-mobile-logo .fh-logo-text {
  font-size: 20px;     /* Slightly smaller on mobile */
}
.fh-mobile-logo .fh-logo-icon {
  width: 28px;
  height: 28px;
  
}

/* Ensure the close button doesn't shrink */
.fh-mobile-close-btn {
  flex-shrink: 0;
}
  @media (max-width: 768px) {
  .fh-search-wrap { display: none; }
  .fh-mobile-search-icon { display: inline-flex; }
  .fh-inner { gap: 0.75rem; }
  .fh-auth { gap: 6px; }
  .fh-btn-ghost { padding: 6px 12px; font-size: 12px; }
  .fh-btn-primary { padding: 6px 14px; font-size: 12px; }
  .fh-avatar-btn { width: 30px; height: 30px; font-size: 12px; }

  /* Hide regular items when search is active */
  .fh-inner.mobile-search-active .fh-logo,
  .fh-inner.mobile-search-active .fh-auth,
  .fh-inner.mobile-search-active .fh-hamburger,
  .fh-inner.mobile-search-active .fh-mobile-search-icon {
    display: none;
    
  }
  .fh-inner.mobile-search-active .fh-mobile-search-container {
    display: flex;
    width: 100%;
    
  }
}
      `}</style>

      {/* Navbar */}
      <nav className={`fh-nav ${scrolled ? "scrolled" : "top"}`}>
        <div
          className={`fh-inner ${mobileSearchActive ? "mobile-search-active" : ""}`}
        >
          <div
            className="fh-logo"
            onClick={goToHome}
            role="button"
            aria-label="Go to home"
          >
            <div className="fh-logo-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM13 10l-2 5 2-2.5L15 15l-2-5z"
                  fill="#fff"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="fh-logo-text">
              Flick<span>Hub</span>
            </span>
          </div>

          <ul className="fh-links">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>

          <div style={{ flex: 1 }} />

          {/* Desktop search */}
          <div
            className={`fh-search-wrap ${query.trim().length > 0 ? "expanded" : ""}`}
            ref={searchRef}
          >
            <div className="fh-search-inner">
              <svg
                className="fh-search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className="fh-search-input"
                placeholder="Search movies..."
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {query && (
                <button
                  className="fh-clear-btn"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            {showSuggestions && (
              <div className="fh-dropdown" role="listbox">
                {loadingSuggestions && (
                  <div className="fh-dropdown-loading">
                    <div className="fh-dot" />
                    <div className="fh-dot" />
                    <div className="fh-dot" />
                  </div>
                )}
                {!loadingSuggestions &&
                  suggestions.length === 0 &&
                  query.trim().length >= 2 && (
                    <div className="fh-dropdown-empty">
                      No movies found for "{query}"
                    </div>
                  )}
                {suggestions.map((movie, index) => (
                  <div
                    key={movie.id}
                    className={`fh-dropdown-item${index === selectedIndex ? " selected" : ""}`}
                    onClick={() => handleSuggestionClick(movie.id)}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="fh-dropdown-no-img">N/A</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="fh-movie-title"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {movie.title}
                      </div>
                      <div className="fh-movie-meta">
                        <span>{movie.release_date?.slice(0, 4) || "—"}</span>
                        <span style={{ opacity: 0.3 }}>·</span>
                        <span className="fh-star">★</span>
                        <span>{movie.vote_average?.toFixed(1) || "?"}</span>
                      </div>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auth & Admin (desktop and mobile normal) */}
          <div className="fh-auth">
            {isLoggedIn ? (
              <>
                <button
                  className="fh-avatar-btn"
                  onClick={() => navigate("/profile")}
                >
                  P
                </button>
                {isAdmin && (
                  <button className="fh-btn-primary" onClick={() => navigate('/admin')}>Admin</button>
                )}
                <button className="fh-btn-admin" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="fh-btn-ghost"
                  onClick={() => navigate("/api/auth/login")}
                >
                  Login
                </button>
                <button
                  className="fh-btn-primary"
                  onClick={() => navigate("/api/auth/register")}
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile inline search container (hidden by default) */}
          <div className="fh-mobile-search-container ">
            {/* Logo block */}
            <div className="fh-mobile-logo" onClick={() => navigate("/")}>
              <div className="fh-logo-icon">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM13 10l-2 5 2-2.5L15 15l-2-5z"
                    fill="#fff"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="fh-logo-text">
                Flick<span>Hub</span>
              </span>
            </div>

            {/* Search input area */}
            <div style={{ position: "relative", flex: 1 }}>
              <svg
                className="fh-search-icon"
                style={{ left: "13px" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                ref={mobileSearchRef}
                type="text"
                className="fh-mobile-search-input"
                placeholder="Search movies..."
                value={mobileQuery}
                onChange={handleMobileInputChange}
                onKeyDown={handleMobileKeyDown}
                autoComplete="off"
              />
              {mobileQuery && (
                <button
                  className="fh-clear-btn"
                  onClick={clearMobileSearch}
                  aria-label="Clear search"
                  style={{ right: "12px" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              className="fh-mobile-close-btn"
              onClick={closeMobileSearch}
              aria-label="Close search"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <button
            className="fh-mobile-search-icon"
            onClick={() => setMobileSearchActive(true)}
            aria-label="Search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>

          <button
            className={`fh-hamburger${mobileMenuOpen ? " open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="fh-bar" />
            <div className="fh-bar" />
            <div className="fh-bar" />
          </button>
        </div>
      </nav>

      {/* Drawer Overlay and Panel (outside nav) */}
      <>
        <div
          className={`fh-drawer-overlay${mobileMenuOpen ? " open" : ""}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`fh-drawer${mobileMenuOpen ? " open" : ""}`}>
          <div className="fh-drawer-header">
            <span
              style={{
                fontFamily: "Bebas Neue",
                fontSize: "20px",
                letterSpacing: "1px",
              }}
            >
              Flick<span style={{ color: "#e53935" }}>Hub</span>
            </span>
            <button
              className="fh-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* <div className="fh-drawer-search">
            <div style={{ position: 'relative' }}>
              <input
                ref={drawerSearchRef}
                type="text"
                className="fh-drawer-search-input"
                placeholder="Search movies..."
                value={drawerQuery}
                onChange={handleDrawerInputChange}
                onKeyDown={handleDrawerKeyDown}
                autoComplete="off"
              />
              {drawerQuery && (
                <button
                  className="fh-clear-btn"
                  onClick={clearDrawerSearch}
                  style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            {/* {drawerShowSuggestions && (
              <div className="fh-drawer-suggestions">
                {drawerLoading && (
                  <div className="fh-dropdown-loading">
                    <div className="fh-dot" /><div className="fh-dot" /><div className="fh-dot" />
                  </div>
                )}
                {!drawerLoading && drawerSuggestions.length === 0 && drawerQuery.trim().length >= 2 && (
                  <div className="fh-dropdown-empty">No movies found for "{drawerQuery}"</div>
                )}
                {drawerSuggestions.map((movie, index) => (
                  <div
                    key={movie.id}
                    className={`fh-dropdown-item${index === drawerSelectedIndex ? ' selected' : ''}`}
                    onClick={() => handleDrawerSuggestionClick(movie.id)}
                    role="option"
                    aria-selected={index === drawerSelectedIndex}
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="fh-dropdown-no-img">N/A</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fh-movie-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movie.title}
                      </div>
                      <div className="fh-movie-meta">
                        <span>{movie.release_date?.slice(0, 4) || '—'}</span>
                        <span style={{ opacity: 0.3 }}>·</span>
                        <span className="fh-star">★</span>
                        <span>{movie.vote_average?.toFixed(1) || '?'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )} 
          </div> */}

          <div className="fh-drawer-nav">
            {/* Home link with icon */}
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 9L12 3L21 9L21 20H15V14H9V20H3V9Z" />
              </svg>
              Home
            </Link>
            {NAV_LINKS.map(({ to, label }) => {
              let icon;
              if (label === "Trending") icon = <path d="M2 20L12 4L22 20" />;
              else if (label === "Upcoming")
                icon = <path d="M12 6V12L15 15" strokeLinecap="round" />;
              else if (label === "Popular")
                icon = (
                  <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" />
                );
              else if (label === "Top Rated")
                icon = (
                  <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" />
                );
              else if (label === "Animated")
                icon = <SiAnimalplanet size={28} />;
              else icon = <circle cx="12" cy="12" r="10" />;
              return (
                <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    {icon}
                  </svg>
                  {label}
                </Link>
              );
            })}
            <div className="fh-drawer-divider" />
            {isLoggedIn ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ color: "#e57373" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M12 8V12L15 15" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    color: "#e57373",
                    background: "rgba(229,57,53,0.08)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H9" />
                    <path d="M16 17L21 12L16 7" />
                    <path d="M21 12H9" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/api/auth/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M15 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H15" />
                    <path d="M10 17L15 12L10 7" />
                    <path d="M15 12H3" />
                  </svg>
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/api/auth/register");
                    setMobileMenuOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M16 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H16" />
                    <path d="M8 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H8" />
                    <path d="M12 8V16" />
                    <path d="M8 12H16" />
                  </svg>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </>
    </>
  );
}

export default Navbar;
