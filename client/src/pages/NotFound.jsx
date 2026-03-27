import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const notFoundStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  .nf-page {
    min-height: calc(100vh - 136px);
    background: #07070f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 16px;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .nf-page::before {
    content: '';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(229,57,53,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .nf-card {
    text-align: center;
    max-width: 480px;
    position: relative;
    z-index: 1;
  }
  .nf-icon-wrap {
    width: 80px;
    height: 80px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 32px;
  }
  .nf-code {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(6rem, 20vw, 10rem);
    letter-spacing: 4px;
    color: #fff;
    line-height: 1;
    margin: 0 0 8px;
  }
  .nf-code span {
    color: #e53935;
  }
  .nf-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(1.4rem, 4vw, 2rem);
    letter-spacing: 2px;
    color: rgba(255,255,255,0.7);
    margin: 0 0 16px;
  }
  .nf-sub {
    font-size: 14px;
    font-weight: 300;
    color: rgba(255,255,255,0.3);
    line-height: 1.7;
    margin: 0 0 36px;
  }
  .nf-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #e53935;
    color: #fff;
    border: none;
    border-radius: 9px;
    padding: 13px 28px;
    font-size: 14px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .nf-btn:hover {
    background: #c62828;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(229,57,53,0.4);
  }
  .nf-btn:active { transform: translateY(0); }
  .nf-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 28px 0;
  }
  .nf-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
  }
  .nf-divider-text {
    font-size: 11px;
    color: rgba(255,255,255,0.15);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .nf-ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.4);
    border-radius: 9px;
    padding: 11px 24px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }
  .nf-ghost-btn:hover {
    border-color: rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.04);
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
    <SEO title="404 Not Found" description="Page not found." />
      <style>{notFoundStyles}</style>
      <div className="nf-page">
        <div className="nf-card">

          {/* Icon */}
          <div className="nf-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          {/* 404 */}
          <div className="nf-code">4<span>0</span>4</div>
          <h1 className="nf-title">Page Not Found</h1>
          <p className="nf-sub">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Go Home */}
          <button className="nf-btn" onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go Home
          </button>

          {/* Divider */}
          <div className="nf-divider">
            <div className="nf-divider-line"/>
            <span className="nf-divider-text">or</span>
            <div className="nf-divider-line"/>
          </div>

          {/* Go Back */}
          <button className="nf-ghost-btn" onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Back
          </button>

        </div>
      </div>
    </>
  );
};

export default NotFound;