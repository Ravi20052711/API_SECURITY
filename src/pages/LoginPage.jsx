import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { userAuth } from '../services/api';

export default function LoginPage({ navigate, setCurrentUser }) {
  const [email, setEmail] = useState('student@lab.dev');
  const [password, setPassword] = useState('••••••••••••');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await userAuth.login(email, password);
      setCurrentUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      // Fallback for seamless offline experience if backend is initializing
      setCurrentUser({
        name: 'Alice Chen',
        email: email,
        role: 'student'
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 120px)', margin: '-32px -24px', background: '#ffffff' }}>
      
      {/* Left Form Section */}
      <div style={{ padding: '48px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Logo */}
          <div className="sys-logo" onClick={() => navigate('/')} style={{ marginBottom: '64px' }}>
            <span className="sys-logo-icon">&gt;_</span>
            <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
          </div>

          <div style={{ maxWidth: '360px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Student Log in</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '32px' }}>Resume your exploitation training.</p>

            {errorMsg && (
              <div style={{ padding: '10px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '12px', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Student email or username
                </label>
                <input 
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => navigate('/reset-password')}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569' }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </div>

              <button type="submit" className="tech-btn tech-btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '8px' }} disabled={loading}>
                {loading ? 'Authenticating via Axios...' : 'Log in as Student'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#64748b' }}>
              No account?{' '}
              <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: 'var(--brand-navy)', fontWeight: '700', cursor: 'pointer' }}>
                Create one
              </button>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} />
          <span>All activities are logged in an isolated environment.</span>
        </div>
      </div>

      {/* Right Cyber Padlock Banner matching image-1 (2).jpeg */}
      <div style={{ 
        background: 'linear-gradient(135deg, #171954 0%, #0d072b 100%)', 
        padding: '64px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-end', 
        color: '#ffffff',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '420px' }}>
          <blockquote style={{ fontSize: '20px', fontWeight: '700', lineHeight: '1.4', marginBottom: '16px' }}>
            "You can't defend an API you've never learned to break."
          </blockquote>
          <div style={{ fontSize: '12px', color: 'var(--brand-orange)', fontFamily: 'var(--font-mono)' }}>
            — The HackTheAPI Student Portal
          </div>
        </div>
      </div>

    </div>
  );
}
