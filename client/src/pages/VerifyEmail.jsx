import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyEmail as verifyEmailApi } from '../utils/api';
import SEO from '../components/SEO';

const verifyStyles = `
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
    text-align: center;
  }
  .auth-logo {
    display: flex;
    align-items: center;
    justify-content: center;
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
    margin: 0 0 12px;
  }
  .auth-sub {
    font-size: 13px;
    font-weight: 300;
    color: rgba(255,255,255,0.4);
    margin-bottom: 24px;
    line-height: 1.6;
  }
  .verify-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  .verify-icon.verifying {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .verify-icon.success {
    background: rgba(76,175,80,0.12);
    border: 1px solid rgba(76,175,80,0.3);
  }
  .verify-icon.error {
    background: rgba(229,57,53,0.1);
    border: 1px solid rgba(229,57,53,0.25);
  }
  .verify-spinner {
    width: 28px;
    height: 28px;
    border: 2px solid rgba(255,255,255,0.1);
    border-top-color: #e53935;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .verify-msg {
    font-size: 14px;
    font-weight: 300;
    color: rgba(255,255,255,0.5);
    margin-bottom: 24px;
    line-height: 1.6;
  }
  .verify-msg.success { color: #81c784; }
  .verify-msg.error { color: #ef9a9a; }
  .auth-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
  .redirect-note {
    font-size: 12px;
    color: rgba(255,255,255,0.2);
    margin-top: 12px;
    font-weight: 300;
  }
`;

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const hasCalled = useRef(false); // prevent double API call in strict mode

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const verify = async () => {
      try {
        const data = await verifyEmailApi(token);
        setStatus('success');
        setMessage(data.msg || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
      }
    };
    verify();
  }, [token]);

  // Countdown and redirect on success
  useEffect(() => {
    if (status === 'success' && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (status === 'success' && redirectCountdown === 0) {
      navigate('/api/auth/login');
    }
  }, [status, redirectCountdown, navigate]);

  const handleLogoClick = () => navigate('/');
  const handleBackToLogin = () => navigate('/api/auth/login');

  return (
    <>
    <SEO title="Verify Email" description="Verify your email address." />
      <style>{verifyStyles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo" onClick={handleLogoClick}>
            <div className="auth-logo-icon">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM13 10l-2 5 2-2.5L15 15l-2-5z"
                  fill="#fff"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="auth-logo-text">Flick<span>Hub</span></span>
          </div>

          <div className={`verify-icon ${status}`}>
            {status === 'verifying' && <div className="verify-spinner" />}
            {status === 'success' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {status === 'error' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            )}
          </div>

          <h1 className="auth-heading">
            {status === 'verifying' && 'Verifying...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          <p className={`verify-msg ${status}`}>{message}</p>

          {status === 'success' && (
            <p className="redirect-note">
              Redirecting to login in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
            </p>
          )}

          {status === 'error' && (
            <button className="auth-link" onClick={handleBackToLogin}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to login
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;