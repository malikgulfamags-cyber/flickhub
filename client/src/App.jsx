// App.js
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import MovieList from './components/MovieList';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Admin from './pages/Admin';
import TrendingPage from './pages/movies/TrendingPage';
import PopularPage from './pages/movies/PopularPage';
import TopRatedPage from './pages/movies/TopRatedPage';
import UpcomingPage from './pages/movies/UpcomingPage';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import AnimePage from './pages/movies/AnimePage';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
       <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f1f2e',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: { primary: '#4caf50', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#e53935', secondary: '#fff' },
          },
        }}
      />
      <Navbar />
      <main className="flex-grow">
        <ScrollToTop/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/api/auth/login" element={<Login />} />
          <Route path="/api/auth/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/api/auth/forget-password" element={<ForgotPassword />} />


          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/popular" element={<PopularPage />} />
          <Route path="/top-rated" element={<TopRatedPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="/anime" element={<AnimePage />} />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;