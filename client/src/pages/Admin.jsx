import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';;
import {
  fetchAdminStats, fetchAllUsers, updateUserRole, deleteUser,
  fetchSettings, updateSetting, fetchFeaturedIds, addFeaturedMovie,
  removeFeaturedMovie, fetchMoviesByIds
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';


const API_BASE = import.meta.env.VITE_API_BASE_URL;

const adminStyles = `
  /* ── Admin Panel Styles (matching your Home design) ── */
  .admin-container {
    background: #07070f;
    min-height: 100vh;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
  }
  .admin-sidebar {
    background: rgba(15, 15, 25, 0.95);
    backdrop-filter: blur(12px);
    border-right: 1px solid rgba(255,255,255,0.05);
  }
  .admin-tab-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 20px;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 8px;
    margin-bottom: 4px;
  }
  .admin-tab-btn:hover {
    background: rgba(229,57,53,0.1);
    color: #fff;
  }
  .admin-tab-btn.active {
    background: #e53935;
    color: #fff;
  }
  .admin-card {
    background: rgba(255,255,255,0.05);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .admin-table {
    width: 100%;
    border-collapse: collapse;
  }
  .admin-table th, .admin-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .admin-table th {
    color: #e53935;
    font-weight: 600;
  }
  .admin-input {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 10px 14px;
    color: #fff;
    width: 100%;
  }
  .admin-btn {
    background: #e53935;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: 0.2s;
  }
  .admin-btn:hover {
    background: #c62828;
  }
  .admin-btn-outline {
    background: transparent;
    border: 1px solid #e53935;
    color: #e53935;
  }
  .admin-btn-outline:hover {
    background: rgba(229,57,53,0.1);
  }
  .admin-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }
  .badge-admin { background: #e53935; color: #fff; }
  .badge-user { background: rgba(255,255,255,0.2); color: #fff; }
  .admin-icon {
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  /* Suggestions dropdown */
  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #1e1e2a;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
    margin-top: 4px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  }
  .suggestion-item {
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .suggestion-item:hover {
    background: rgba(229,57,53,0.2);
  }
  .suggestion-img {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  .suggestion-info {
    flex: 1;
  }
  .suggestion-title {
    font-weight: 500;
    font-size: 14px;
  }
  .suggestion-year {
    font-size: 12px;
    color: #aaa;
  }
`;

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// FeaturedTab as a separate component to isolate state
const FeaturedTab = memo(({ featuredMovies, featuredIds, addFeatured, removeFeatured, actionLoading }) => {
  const [newId, setNewId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${encodeURIComponent(debouncedSearch)}`
        );
        const data = await res.json();
        setSuggestions(data.results.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Suggestion fetch error:', err);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSuggestionClick = (movie) => {
    addFeatured(movie.id);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus(); // Keep focus on input after adding
  };

  return (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Manage Featured Movies</h2>

      {/* Add by ID */}
      <div className="admin-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '16px' }}>Add by TMDB ID</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={newId}
            onChange={e => setNewId(e.target.value)}
            placeholder="Enter TMDB Movie ID (e.g. 12345)"
            className="admin-input"
          />
          <button onClick={() => addFeatured(newId)} disabled={actionLoading} className="admin-btn">
            Add
          </button>
        </div>
      </div>

      {/* Search & Add with suggestions */}
      <div className="admin-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '16px' }}>Search & Add</h3>
        <div ref={containerRef} style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="admin-input"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map(movie => (
                <div key={movie.id} className="suggestion-item" onClick={() => handleSuggestionClick(movie)}>
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/40x60?text=No+Image'}
                    alt={movie.title}
                    className="suggestion-img"
                  />
                  <div className="suggestion-info">
                    <div className="suggestion-title">{movie.title}</div>
                    <div className="suggestion-year">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {searchQuery && !suggestions.length && (
          <p style={{ color: '#aaa', marginTop: '8px' }}>No results found. Try a different title.</p>
        )}
      </div>

      {/* Current Featured Movies */}
      <div className="admin-card">
        <h3 style={{ marginBottom: '16px' }}>Current Featured Movies</h3>
        {featuredMovies.length === 0 ? (
          <p>No featured movies yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
            {featuredMovies.map(movie => (
              <div key={movie.id} style={{ position: 'relative' }}>
                <MovieCard movie={movie} />
                <button
                  onClick={() => removeFeatured(movie.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#e53935',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// Main Admin component
function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, featuredCount: 0 });
  const [featuredIds, setFeaturedIds] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ carouselInterval: 6000, slidesCount: 6 });
  const [logs, setLogs] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const { token, user, logout } = useAuth();

  // Authentication & initial data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user || user.role !== 'admin') {
      alert('Admin access only');
      navigate('/');
      return;
    }
    setIsAdmin(true);
    loadDashboardData();
    loadFeatured();
    loadUsers();
    loadSettings();
    loadLogs();
    setLoading(false);
  }, []);

  const fetchWithAuth = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: { 'x-auth-token': token, ...options.headers },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Request failed');
    }
    return res.json();
  };

  const loadDashboardData = async () => {
    try {
      const stats = await fetchAdminStats(token);
      setStats(stats);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadFeatured = async () => {
    try {
      const ids = await fetchFeaturedIds();
      setFeaturedIds(ids);
      if (ids.length) {
        const movies = await fetchMoviesByIds(ids);
        setFeaturedMovies(movies);
      } else {
        setFeaturedMovies([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await fetchAllUsers(token);
      setUsers(users);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await fetchSettings(token);
      setSettings(settings);
    } catch (err) {
      setError(err.message);
    }
  };

  const addFeatured = async (movieId) => {
    if (!movieId) return;
    setActionLoading(true);
    try {
      const updated = await addFeaturedMovie(movieId, token);
      setFeaturedIds(updated);
      loadDashboardData();
      loadFeatured();
      toast.success('Movie added to featured');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const removeFeatured = async (movieId) => {
    setActionLoading(true);
    try {
      const updated = await removeFeaturedMovie(movieId, token);
      setFeaturedIds(updated);
      loadDashboardData();
      loadFeatured();
      toast.success('Movie removed from featured');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await fetchWithAuth(API_BASE + '/api/admin/logs');
      setLogs(data);
    } catch (err) { setError(err.message); }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await fetchWithAuth(API_BASE + '/api/admin/users/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      loadUsers();
      loadDashboardData();
      loadLogs();
      toast.success(`User role updated to ${newRole}`);
    } catch (err) { 
      setError(err.message);
      toast.error(err.message);
     }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await fetchWithAuth(`${API_BASE}/api/admin/users/${userId}`, { method: 'DELETE' });
      loadUsers();
      loadDashboardData();
      loadLogs();
      toast.success('User deleted');
    } catch (err) { 
      setError(err.message); 
      toast.error(err.message);
  }
  };

  const updateSetting = async (key, value) => {
    try {
      await fetchWithAuth(API_BASE + '/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      loadSettings();
      loadLogs();
      toast.success('Setting update successfully.....');
    } catch (err) { 
      setError(err.message); 
      toast.error(err.message);
  }
  };

  if (loading) {
    return <div className="admin-container" style={{ padding: '20px' }}>Loading admin panel...</div>;
  }
  if (!isAdmin) return null;

  // Dashboard Tab
  const DashboardTab = () => (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="admin-card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e53935' }}>{stats.totalUsers}</div>
          <div style={{ color: '#aaa' }}>Total Users</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e53935' }}>{stats.totalAdmins}</div>
          <div style={{ color: '#aaa' }}>Admins</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e53935' }}>{stats.featuredCount}</div>
          <div style={{ color: '#aaa' }}>Featured Movies</div>
        </div>
      </div>
    </div>
  );

  // Users Tab
  const UsersTab = () => (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>User Management</h2>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.role !== 'admin' ? (
                    <button onClick={() => updateUserRole(user._id, 'admin')} className="admin-btn-outline admin-btn" style={{ marginRight: '8px' }}>Make Admin</button>
                  ) : (
                    <button onClick={() => updateUserRole(user._id, 'user')} className="admin-btn-outline admin-btn" style={{ marginRight: '8px' }}>Remove Admin</button>
                  )}
                  <button onClick={() => deleteUser(user._id)} className="admin-btn" style={{ background: '#c62828' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Settings Tab
  const SettingsTab = () => (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Site Settings</h2>
      <div className="admin-card">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Carousel Interval (ms)</label>
          <input
            type="number"
            value={settings.carouselInterval}
            onChange={e => setSettings({ ...settings, carouselInterval: parseInt(e.target.value) })}
            className="admin-input"
            style={{ width: '200px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Hero Slides Count</label>
          <input
            type="number"
            value={settings.slidesCount}
            onChange={e => setSettings({ ...settings, slidesCount: parseInt(e.target.value) })}
            className="admin-input"
            style={{ width: '200px' }}
          />
        </div>
        <button onClick={() => {
          updateSetting('carouselInterval', settings.carouselInterval);
          updateSetting('slidesCount', settings.slidesCount);
        }} className="admin-btn">Save Settings</button>
      </div>
    </div>
  );

  // Logs Tab
  const LogsTab = () => (
    <div>
      <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Activity Log</h2>
      <div className="admin-card">
        {logs.length === 0 ? (
          <p>No logs yet.</p>
        ) : (
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {logs.map(log => (
              <div key={log._id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa' }}>
                  <span>{log.adminId?.name || 'System'}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div style={{ marginTop: '4px' }}>{log.action}</div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <pre style={{ fontSize: '10px', marginTop: '4px', color: '#888' }}>{JSON.stringify(log.details, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
    <SEO title="Admin Panel" description="Admin dashboard for FlickHub." />
      <style>{adminStyles}</style>
      <div className="admin-container" style={{ display: 'flex' }}>
        <div className="admin-sidebar" style={{ width: '260px', padding: '20px 0' }}>
          <div style={{ padding: '0 20px 20px', fontSize: '20px', fontWeight: 'bold', color: '#e53935' }}>
            Admin Panel
          </div>
          <nav>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'featured', label: 'Featured Movies', icon: '🎬' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
              { id: 'logs', label: 'Activity Log', icon: '📜' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="admin-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={{ flex: 1, padding: '30px' }}>
          {error && <div style={{ background: '#e53935', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'featured' && (
            <FeaturedTab
              featuredMovies={featuredMovies}
              featuredIds={featuredIds}
              addFeatured={addFeatured}
              removeFeatured={removeFeatured}
              actionLoading={actionLoading}
            />
          )}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'logs' && <LogsTab />}
        </div>
      </div>
    </>
  );
}

export default Admin;