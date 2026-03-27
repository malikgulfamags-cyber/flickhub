import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';


const API_BASE = import.meta.env.VITE_API_BASE_URL;

const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .auth-page {
    min-height: 100vh;
    background: #07070f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .auth-page::before {
    content: '';
    position: fixed;
    top: -100px; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(229,57,53,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 40px 36px 36px;
    position: relative;
    z-index: 1;
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 32px;
    cursor: pointer;
  }
  .auth-logo-icon {
    width: 28px; height: 28px;
    background: #e53935;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
  }
  .auth-logo-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: #fff;
  }
  .auth-logo-text span { color: #e53935; }

  .auth-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2rem;
    letter-spacing: 2px;
    color: #fff;
    margin: 0 0 6px;
  }
  .auth-sub {
    font-size: 13px;
    font-weight: 300;
    color: rgba(255,255,255,0.3);
    margin-bottom: 28px;
  }

  .auth-field { margin-bottom: 18px; }
  .auth-label {
    display: block;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 8px;
    font-weight: 400;
  }
  .auth-input {
    width: 100%;
    height: 46px;
    padding: 0 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 9px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    outline: none;
    caret-color: #e53935;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .auth-input::placeholder { color: rgba(255,255,255,0.18); }
  .auth-input:focus {
    border-color: rgba(229,57,53,0.45);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(229,57,53,0.1);
  }

  .auth-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 14px;
    background: rgba(229,57,53,0.08);
    border: 1px solid rgba(229,57,53,0.2);
    border-radius: 8px;
    color: #ef9a9a;
    font-size: 13px;
    margin-bottom: 20px;
  }
  /* field-specific error (small) */
  .auth-field-error {
    margin-top: 8px;
    font-size: 12px;
    color: #ef9a9a;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .auth-submit {
    width: 100%;
    height: 48px;
    background: #e53935;
    color: #fff;
    border: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.5px;
    margin-top: 6px;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .auth-submit:hover {
    background: #c62828;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(229,57,53,0.35);
  }
  .auth-submit:active { transform: translateY(0); }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .auth-footer {
    margin-top: 22px;
    text-align: center;
    font-size: 13px;
    font-weight: 300;
    color: rgba(255,255,255,0.3);
  }
  .auth-link {
    color: #e53935;
    background: none;
    border: none;
    padding: 0;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.2s;
  }
  .auth-link:hover { color: #ef5350; }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }
  .auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .auth-divider-text { font-size: 11px; color: rgba(255,255,255,0.2); letter-spacing: 1px; }
`;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email address")
        .required("*Email is required*"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("*Password is required*"),
    }),
    onSubmit: async (values) => {
      setServerError('');
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email.trim(),
            password: values.password,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Login failed');
        toast.success('Logged in successfully!');

        // Use context login instead of manual localStorage
        login(data.user, data.token);

        navigate('/');
        // window.location.reload(); // no longer needed
      }catch (err) {
        setServerError(err.message);
        toast.error(err.message); 
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
     <SEO title="Login" description="Sign in to your FlickHub account." />
      <style>{authStyles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo" onClick={() => navigate('/')}>
            <div className="auth-logo-icon">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM13 10l-2 5 2-2.5L15 15l-2-5z" fill="#fff" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="auth-logo-text">Flick<span>Hub</span></span>
          </div>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-sub">Sign in to your account to continue</p>

          {serverError && (
            <div className="auth-error" style={{ marginBottom: '20px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate>
            {/* Email Field */}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                {...formik.getFieldProps('email')}
                autoComplete="email"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="auth-field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                {...formik.getFieldProps('password')}
                autoComplete="current-password"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="auth-field-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {formik.errors.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading || !formik.isValid}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="flex justify-between ">
           <div className="auth-footer">
            Don't have an account?{' '}
            <button
              className="auth-link"
              onClick={() => navigate('/api/auth/register')}
            >
              Create one
            </button>
          </div>
         <div className="auth-footer">
            Forget Password?{' '}
            <button
              className="auth-link"
              onClick={() => navigate('/api/auth/forget-password')}
            >
              Click Here
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;