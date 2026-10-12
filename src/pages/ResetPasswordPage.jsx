import React, { useState } from 'react';
import { userAuth } from '../services/api';

export default function ResetPasswordPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your registered email address.");
      setLoading(false);
      return;
    }

    try {
      await userAuth.requestPasswordReset(email.trim());
      setMessage("If an account exists with this email, password recovery instructions have been dispatched.");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Unable to dispatch recovery request. Please verify your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1.15fr',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif'
    }} className="auth-split-grid">
      
      {/* Left Column: Reset Form */}
      <div style={{
        padding: '48px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }} className="auth-form-container">
        
        {/* Top Logo */}
        <div 
          onClick={() => navigate('/')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              API_SECURITY
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div style={{ maxWidth: '380px', width: '100%', margin: '40px 0' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
            Enter your email to receive recovery instructions.
          </p>

          {message && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '20px',
              fontWeight: '500'
            }}>
              {message}
            </div>
          )}

          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '20px',
              fontWeight: '500'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Academic Email
              </label>
              <input 
                type="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '4px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending instructions...' : 'Send Recovery Link'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Remembered your credentials?{' '}
            <button 
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            >
              Back to Sign In
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          © API_SECURITY Platform 2026
        </div>
      </div>

      {/* Right Column: Help & Policy Notice */}
      <div style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle at 10% 10%, #f1f5f9 0%, #f8fafc 40%, #ffffff 85%)',
        borderLeft: '1px solid #e2e8f0',
        padding: '64px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }} className="auth-showcase-container">
        
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Identity & Access Security
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '12px 0 16px 0', letterSpacing: '-0.02em' }}>
            Session & Credential Policy
          </h2>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
            Password reset links expire after 30 minutes for laboratory integrity. If you are an instructor or assessor experiencing login difficulty, contact the local lab administrator.
          </p>

          <div style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
              Standard Test Credentials
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              • Student: <code>student@lab.dev</code> / <code>student123</code><br/>
              • Assessor: <code>assessor@lab.dev</code> / <code>assessor123</code><br/>
              • Admin: <code>admin@lab.dev</code> / <code>admin123</code>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Autonomous Protocol Security Research Lab
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-split-grid {
            grid-template-columns: 1fr !important;
          }
          .auth-showcase-container {
            display: none !important;
          }
          .auth-form-container {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
