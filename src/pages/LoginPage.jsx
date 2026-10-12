import React, { useState } from 'react';
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

    localStorage.removeItem('user_profile');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');

    if (!email.trim()) {
      setErrorMsg("Please enter your email or username.");
      setLoading(false);
      return;
    }

    try {
      const res = await userAuth.login(email.trim(), password || 'student123');
      if (res && res.user && res.token) {
        localStorage.setItem('user_profile', JSON.stringify(res.user));
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('token', res.token);
        localStorage.setItem('access_token', res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        throw new Error("Invalid username or password.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Authentication failed. Invalid email or password.";
      setErrorMsg(msg);
      setCurrentUser(null);
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
      
      {/* Left Column: Sign In Form */}
      <div style={{
        padding: '48px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }} className="auth-form-container">
        
        {/* Top Brand Logo */}
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
          {/* Security Emblem Icon */}
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

        {/* Center Main Form */}
        <div style={{ maxWidth: '380px', width: '100%', margin: '36px 0' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Sign In
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px', lineHeight: '1.5' }}>
            Enter your credentials to access the laboratory workbench, exercises, and evaluation telemetry.
          </p>

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

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Email or Username
              </label>
              <input 
                type="text"
                required
                placeholder="student@lab.dev or username"
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

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  style={{ background: 'none', border: 'none', fontSize: '12px', color: '#2563eb', cursor: 'pointer', padding: 0, fontWeight: '500' }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 64px 11px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
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
                marginTop: '6px',
                transition: 'background-color 0.15s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Signing in to platform...' : 'Sign In to Platform'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            New student or researcher?{' '}
            <button 
              onClick={() => navigate('/signup')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            >
              Register here
            </button>
          </div>
        </div>

        {/* Bottom Left Footer */}
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          © API_SECURITY Platform 2026
        </div>
      </div>

      {/* Right Column: Testimonial & Real Product UI Showcase */}
      <div style={{
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle at 10% 10%, #f1f5f9 0%, #f8fafc 40%, #ffffff 85%)',
        borderLeft: '1px solid #e2e8f0',
        padding: '64px 48px 0 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }} className="auth-showcase-container">
        
        {/* Quote & Testimonial */}
        <div style={{ maxWidth: '580px' }}>
          <p style={{
            fontSize: '19px',
            fontWeight: '600',
            lineHeight: '1.45',
            color: '#0f172a',
            letterSpacing: '-0.01em',
            marginBottom: '16px'
          }}>
            "Securing autonomous AI agents and REST microservices requires ground-truth verification and practical execution benchmarks. The API_SECURITY platform provides rigorous containerized validation for modern vulnerability research."
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>
              Cybersecurity Research Division
            </span>
            <div style={{ fontSize: '14px', color: '#f59e0b', letterSpacing: '2px' }}>
              ★★★★★
            </div>
          </div>
        </div>

        {/* Product UI Showcase Window (Security Red Teaming & MCP Inspector) */}
        <div style={{
          marginTop: '28px',
          backgroundColor: '#ffffff',
          borderRadius: '12px 12px 0 0',
          border: '1px solid #cbd5e1',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          display: 'flex',
          height: '460px',
          overflow: 'hidden'
        }}>
          {/* Left Icon Toolbar */}
          <div style={{
            width: '48px',
            borderRight: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
            gap: '16px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: '700'
            }}>
              ⚡
            </div>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>📄</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>🛡️</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>🔍</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>🗄️</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>⑂</span>
            <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: 'auto' }}>⚙️</span>
          </div>

          {/* Center Configuration Form */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                MCP v1.0 Protocol & Endpoint Configure
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
              Target environment parameters for automated exploit verification
            </div>

            {/* Target Specifications */}
            <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Agentic Target Model</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                <span>Autonomous Agent :</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>Qwen2.5-Coder (Ollama)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <span>Protocol Standard :</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>MCP JSON-RPC 2.0</span>
              </div>
            </div>

            {/* Active Guardrails & Tools */}
            <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Tool Inspection & Guardrails</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                <span>Vulnerability Focus :</span>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>Tool Poisoning / BFLA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                <span>Ground-Truth Oracle :</span>
                <span style={{ color: '#16a34a', fontWeight: '600' }}>Active (Deterministic)</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
                <span style={{ border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>JSON Payload</span>
                <span style={{ border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px' }}>Headers</span>
                <span style={{ border: '1px solid #0f172a', backgroundColor: '#0f172a', color: '#ffffff', padding: '2px 6px', borderRadius: '4px' }}>Execution Trace</span>
              </div>
            </div>

            {/* Docker Runtime Status */}
            <div style={{ padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Isolated Container Instance</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>Endpoint : http://127.0.0.1:8000/api/v1/</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Status : Ready for telemetry</div>
            </div>
          </div>

          {/* Right Configuration Tabs */}
          <div style={{ width: '220px', borderLeft: '1px solid #f1f5f9', padding: '16px', backgroundColor: '#f8fafc' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
              ⓘ 5-Stage Evaluation Pipeline
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Active Session</div>
              <input type="text" readOnly value="Lab-BFLA-Admin-01" style={{ fontSize: '11px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', backgroundColor: '#ffffff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#0f172a' }}>
                <span style={{ color: '#2563eb' }}>⊞</span> 1. Pre-Test Baseline
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
                <span style={{ color: '#16a34a' }}>↕</span> 2. Guided Exploitation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
                <span style={{ color: '#d97706' }}>⑂</span> 3. Transfer Evaluation
              </div>
            </div>
          </div>
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
