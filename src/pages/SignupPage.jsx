import React, { useState } from 'react';
import { userAuth } from '../services/api';

export default function SignupPage({ navigate, setCurrentUser }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [institution, setInstitution] = useState('Department of Computer Science');
  const [ethicalConsent, setEthicalConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const parts = fullName.trim().split(' ');
      const firstName = parts[0] || 'User';
      const lastName = parts.slice(1).join(' ') || '';

      const res = await userAuth.signup({
        username: email.trim(),
        email: email.trim(),
        password: password,
        first_name: firstName,
        last_name: lastName,
        role: role,
        institution: institution,
        ethical_agreement_accepted: ethicalConsent
      });

      if (res && res.user) {
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || err.message || "Signup failed. Please try again.";
      setErrorMsg(msg);
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
      
      {/* Left Column: Sign Up Form */}
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

        {/* Center Main Form */}
        <div style={{ maxWidth: '400px', width: '100%', margin: '28px 0' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Create Academic Account
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            Register to launch isolated Docker targets and participate in benchmark evaluations.
          </p>

          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
              fontWeight: '500'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <input 
                type="text"
                required
                placeholder="Dr. Alex Rivera or Student Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Academic Email
              </label>
              <input 
                type="email"
                required
                placeholder="student@lab.dev or email@domain.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px'
                  }}
                >
                  <option value="student">Student / Learner</option>
                  <option value="instructor">Instructor / Faculty</option>
                  <option value="assessor">Security Assessor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Password
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Institution / Department
              </label>
              <input 
                type="text"
                placeholder="Department of Computer Science"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
              <input 
                type="checkbox" 
                id="ethical"
                checked={ethicalConsent}
                onChange={(e) => setEthicalConsent(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="ethical" style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                I agree to only execute exploits inside isolated laboratory containers for authorized research and educational evaluation.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading || !ethicalConsent}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                marginTop: '6px',
                transition: 'background-color 0.15s',
                opacity: loading || !ethicalConsent ? 0.6 : 1
              }}
            >
              {loading ? 'Creating account...' : 'Create Research Account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          © API_SECURITY Platform 2026
        </div>
      </div>

      {/* Right Column: Information & Research Showcase */}
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
            Curriculum & Assessment Structure
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '12px 0 16px 0', letterSpacing: '-0.02em' }}>
            Empirical Security Benchmarking for Emerging Protocol Flaws
          </h2>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '28px' }}>
            Gain hands-on proficiency in identifying, exploiting, and remediating Broken Object Level Authorization (BOLA), Broken Function Level Authorization (BFLA), and Model Context Protocol (MCP) tool poisoning vulnerabilities.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>1. Parallel Conceptual Assessment</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Pre-test and post-test measurement using Hake's normalized gain metric.</div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>2. Live Docker Exploitation Workbench</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Real HTTP request crafting with server-side ground truth verification.</div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>3. Qwen2.5-Coder Adaptive AI Support</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Local Ollama-powered contextual guidance without leaking direct flag solutions.</div>
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
