import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from "yup";
import { register as registerApi } from '../utils/api';
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
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 32px; cursor: pointer;
  }
  .auth-logo-icon {
    width: 28px; height: 28px; background: #e53935;
    border-radius: 7px; display: flex; align-items: center; justify-content: center;
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
    width: 100%; height: 46px; padding: 0 16px;
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
    width: 100%; height: 48px; background: #e53935; color: #fff; border: none;
    border-radius: 9px; font-size: 14px; font-weight: 500; 
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; letter-spacing: 0.5px; margin-top: 6px;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .auth-submit:hover { 
    background: #c62828; 
    transform: translateY(-1px); 
    box-shadow: 0 8px 24px rgba(229,57,53,0.35); 
  }
  .auth-submit:active { transform: translateY(0); }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
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

  .auth-strength {
    display: flex; gap: 4px; margin-top: 8px;
  }
  .auth-strength-bar {
    flex: 1; height: 3px; border-radius: 2px;
    background: rgba(255,255,255,0.1);
    transition: background 0.3s;
  }
  .auth-success {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 14px;
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    border-radius: 8px;
    color: #81c784;
    font-size: 13px;
    margin-bottom: 20px;
  }
  .auth-strength-bar.weak { background: #e53935; }
  .auth-strength-bar.medium { background: #f5c518; }
  .auth-strength-bar.strong { background: #4caf50; }
`;

function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  return s;
}

function Register() {
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("*Full name is required*"),
      email: Yup.string()
        .email("Please enter a valid email address")
        .required("*Email is required*"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .matches(/[A-Z]/, "Password must contain at least 1 uppercase letter")
        .matches(/[0-9]/, "Password must contain at least 1 number")
        .matches(/[^A-Za-z0-9]/, "Password must contain at least 1 special characters")
        .required("*Password is required*"),
    }),

      onSubmit: async (values) => {
        setServerError('');
        setSuccessMsg('');
        setLoading(true);
        try {
          const data = await registerApi(values.name.trim(), values.email.trim(), values.password);
          toast.success(data.msg || 'Registration successful! Check your email to verify.');
          formik.resetForm();
          setTimeout(() => {
            navigate('/api/auth/login');
          }, 3000);
        } catch (err) {
          setServerError(err.message);
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
      },
  });

  const strength = getStrength(formik.values.password);
  const strengthClass = strength === 0 ? '' : strength === 1 ? 'weak' : strength === 2 ? 'medium' : 'strong';

  return (
    <>
    <SEO title="Sign Up" description="Create a new FlickHub account." />
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

          <h1 className="auth-heading">Create account</h1>
          <p className="auth-sub">Join FlickHub and start building your collection</p>

          {serverError && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              {serverError}
            </div>
          )}

          {successMsg && (
            <div className="auth-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {successMsg}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} noValidate>
            {/* Name field */}
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Your name"
                {...formik.getFieldProps('name')}
                autoComplete="name"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="auth-field-error">
                  {formik.errors.name}
                </div>
              )}
            </div>

            {/* Email field */}
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
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password field (with strength meter) */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                placeholder="Create a strong password"
                {...formik.getFieldProps('password')}
                autoComplete="new-password"
              />
              {formik.values.password && (
                <div className="auth-strength">
                  {[0,1,2].map(i => (
                    <div 
                      key={i} 
                      className={`auth-strength-bar${i < strength ? ` ${strengthClass}` : ''}`} 
                    />
                  ))}
                </div>
              )}
              {formik.touched.password && formik.errors.password && (
                <div className="auth-field-error">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="auth-submit" 
              disabled={loading || !formik.isValid}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <button 
              className="auth-link" 
              onClick={() => navigate('/api/auth/login')}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;


