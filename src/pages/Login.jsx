import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Droplets, CheckCircle, ShieldCheck, User } from 'lucide-react';
import { authService } from '../services/authService';
import ConfigBanner from '../components/ConfigBanner';

export function Login({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(email, password, name, role);
        setSuccessMessage('Registration successful! Logging you in...');
        setTimeout(async () => {
          if (onAuthSuccess) await onAuthSuccess();
          navigate(from, { replace: true });
        }, 1200);
      } else {
        await authService.signIn(email, password);
        if (onAuthSuccess) await onAuthSuccess();
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Auth error:', err);
      let message = err.message || 'Authentication failed. Please check your credentials.';
      if (message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please verify and try again.';
      } else if (message.includes('already registered')) {
        message = 'An account with this email already exists. Please log in instead.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto', padding: '0 1rem' }}>
      <ConfigBanner />

      <div className="card" style={{ padding: '2rem 1.5rem', boxShadow: 'var(--shadow-lg)' }}>
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-50)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <img src="/logo.svg" alt="FixIt Campus" style={{ width: '38px', height: '38px' }} />
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isSignUp ? 'Create Campus Account' : 'Welcome to FixIt Campus'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {isSignUp
              ? 'Join campus water conservation & sanitation reporting'
              : 'Sign in to report leaks, view tickets, and track fixes'}
          </p>
        </div>

        {/* Tab switch */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--slate-100)',
          borderRadius: 'var(--radius-md)',
          padding: '0.25rem',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: !isSignUp ? '#ffffff' : 'transparent',
              color: !isSignUp ? 'var(--primary-700)' : 'var(--slate-600)',
              boxShadow: !isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: isSignUp ? '#ffffff' : 'transparent',
              color: isSignUp ? 'var(--primary-700)' : 'var(--slate-600)',
              boxShadow: isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--danger-50)',
            color: 'var(--danger-700)',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--danger-200, #fecaca)'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--success-50)',
            color: 'var(--success-700)',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            border: '1px solid var(--success-200, #a7f3d0)'
          }}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Alex Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Campus Email</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="name@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  border: `1px solid ${role === 'student' ? 'var(--primary-600)' : 'var(--slate-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: role === 'student' ? 'var(--primary-50)' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                  />
                  <User size={14} /> Student
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  border: `1px solid ${role === 'admin' ? '#b45309' : 'var(--slate-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: role === 'admin' ? '#fef3c7' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                  />
                  <ShieldCheck size={14} /> Admin
                </label>
              </div>
              <div className="form-helper">
                {role === 'admin' ? 'Grants access to admin dashboard, status changes & analytics.' : 'Report leaks, track fixes & upvote campus issues.'}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '1rem' }}
          >
            {loading ? (
              <span>Processing...</span>
            ) : isSignUp ? (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Hint */}
        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          backgroundColor: 'var(--slate-50)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--slate-200)',
          fontSize: '0.75rem',
          color: 'var(--slate-500)',
          lineHeight: 1.4
        }}>
          💡 <strong>Hackathon Demo Tip:</strong> You can create both <em>Student</em> and <em>Admin</em> accounts using the Sign Up tab above to test the full lifecycle.
        </div>
      </div>
    </div>
  );
}

export default Login;
