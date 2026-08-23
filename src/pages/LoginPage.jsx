import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { userAuth } from '../services/api';

export default function LoginPage({ navigate, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your email or username.");
      setLoading(false);
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const res = await userAuth.login(email.trim(), password);
      if (res && res.user) {
        localStorage.setItem('user_profile', JSON.stringify(res.user));
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('access_token', res.token);
        }
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        throw new Error("Invalid username or password.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Authentication failed. Invalid username or password.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: 'calc(100vh - 120px)', margin: '0', background: '#ffffff', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      
      {/* Left Form Section */}
      <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Logo */}
          <div className="sys-logo" onClick={() => navigate('/')} style={{ marginBottom: '48px', cursor: 'pointer' }}>
            <span className="sys-logo-icon">&gt;_</span>
            <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
          </div>

          <div style={{ maxWidth: '380px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Sign in to your Account</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '28px' }}>Resume your API security exploitation training.</p>

            {errorMsg && (
              <div style={{ padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '4px', fontSize: '12px', marginBottom: '20px', fontWeight: '600' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Email or Username
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. student@lab.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => navigate('/reset-password')}
                    style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--brand-orange)', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="tech-btn tech-btn-primary" 
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px' }}
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In'}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

            <div style={{ marginTop: '28px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
              Don't have an account yet?{' '}
              <button 
                onClick={() => navigate('/signup')}
                style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '40px' }}>
          &copy; 2026 HackTheAPI Security Platform. Authorized training environment.
        </div>
      </div>

      {/* Right Brand Showcase Container */}
      <div style={{ background: 'linear-gradient(135deg, var(--brand-navy) 0%, #0f0c36 100%)', color: '#ffffff', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255, 152, 0, 0.15)', border: '1px solid var(--brand-orange)', borderRadius: '20px', color: 'var(--brand-orange)', fontSize: '11px', fontWeight: '700', marginBottom: '24px' }}>
            <ShieldCheck size={14} />
            <span>ROLE-BASED API SECURITY PLATFORM</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '900', lineHeight: '1.2', marginBottom: '16px' }}>
            Master OWASP API Top 10 Security Vulnerabilities.
          </h2>

          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '32px' }}>
            Exploit real isolated Docker containers, verify authorization flaws, and receive instant feedback from the AI assistant.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Student, Instructor & Assessor RBAC', 'Isolated Per-Session Docker Targets', 'Ollama Qwen AI Exploit Guidance'].map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                <span style={{ color: 'var(--brand-orange)', fontWeight: 'bold' }}>✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
