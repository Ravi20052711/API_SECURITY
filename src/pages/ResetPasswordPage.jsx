import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', width: '100%' }}>
      <div className="tech-card" style={{ padding: '36px' }}>
        
        {/* Logo */}
        <div className="sys-logo" onClick={() => navigate('/')} style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <span className="sys-logo-icon">&gt;_</span>
          <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="tech-btn tech-btn-sm tech-btn-secondary"
          style={{ marginBottom: '20px' }}
        >
          <ArrowLeft size={12} />
          <span>Back to Login</span>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Reset Your Password</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Enter your account email to receive a secure token reset link</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px', background: '#d1fae5', border: '1px solid #34d399', borderRadius: 'var(--radius-sm)' }}>
            <CheckCircle2 color="#059669" size={36} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#065f46', marginBottom: '6px' }}>Reset Token Sent</h3>
            <p style={{ fontSize: '12px', color: '#047857', lineHeight: '1.4' }}>
              We have dispatched a token reset link to <strong>{email}</strong>. Check your inbox to complete verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Registered Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@lab.dev"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button type="submit" className="tech-btn tech-btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
              <Send size={14} />
              <span>Send Reset Token</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
