import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, Key, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { authApi } from '../services/api';

export default function ResetPasswordPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState(1); // 1: Request Token | 2: Enter Code & Reset | 3: Success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setAttemptsLeft(3);

    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res) {
        setStep(2);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authApi.resetPasswordConfirm(resetToken.trim(), newPassword, email);
      if (res) {
        setStep(3);
      }
    } catch (err) {
      const remaining = err.response?.data?.attempts_left;
      if (remaining !== undefined) {
        setAttemptsLeft(remaining);
      } else {
        setAttemptsLeft(prev => Math.max(0, prev - 1));
      }
      const msg = err.response?.data?.error || err.message || "Password reset failed. Invalid code.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '40px auto', width: '100%' }}>
      <div className="tech-card" style={{ padding: '36px' }}>
        
        {/* Logo */}
        <div className="sys-logo" onClick={() => navigate('/')} style={{ justifyContent: 'center', marginBottom: '24px', cursor: 'pointer' }}>
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
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
            {step === 1 && "Reset Your Password"}
            {step === 2 && "Enter Verification Code"}
            {step === 3 && "Password Reset Complete"}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            {step === 1 && "Enter your account email to receive your password reset code via email"}
            {step === 2 && "Enter the verification code sent to your email to choose a new password"}
            {step === 3 && "Your account password has been updated successfully!"}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '4px', fontSize: '12px', marginBottom: '20px', fontWeight: '600' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* STEP 1: REQUEST TOKEN */}
        {step === 1 && (
          <form onSubmit={handleRequestToken} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Account Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. nagaravisanthosh@gmail.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button type="submit" className="tech-btn tech-btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center' }}>
              <Send size={14} />
              <span>{loading ? 'Sending Code to Email...' : 'Send Reset Code to Email'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: CONFIRM RESET CODE & NEW PASSWORD */}
        {step === 2 && (
          <form onSubmit={handleConfirmReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '700', marginBottom: '2px' }}>
                📧 Reset Code Sent via Email
              </div>
              <p style={{ fontSize: '11px', color: '#1e3a8a', margin: 0, lineHeight: '1.4' }}>
                Please check your inbox (<strong>{email}</strong>) for your reset code. You have <strong style={{ color: attemptsLeft <= 1 ? '#dc2626' : '#1e40af' }}>{attemptsLeft} of 3 attempts</strong> remaining.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                  Verification Code (From Email)
                </label>
                <span className="mono" style={{ fontSize: '11px', fontWeight: '800', color: attemptsLeft <= 1 ? '#dc2626' : '#059669' }}>
                  {attemptsLeft}/3 Attempts Left
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  required
                  disabled={attemptsLeft <= 0}
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste verification code from email"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    background: attemptsLeft <= 0 ? '#f1f5f9' : '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={attemptsLeft <= 0}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    background: attemptsLeft <= 0 ? '#f1f5f9' : '#ffffff',
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

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={attemptsLeft <= 0}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #cbd5e1',
                    background: attemptsLeft <= 0 ? '#f1f5f9' : '#ffffff',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {attemptsLeft <= 0 ? (
              <button 
                type="button" 
                className="tech-btn tech-btn-amber"
                onClick={() => { setStep(1); setResetToken(''); setErrorMsg(null); setAttemptsLeft(3); }}
                style={{ width: '100%', padding: '12px', fontSize: '13px', justifyContent: 'center' }}
              >
                Request New Reset Code &rarr;
              </button>
            ) : (
              <button type="submit" className="tech-btn tech-btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center' }}>
                <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            )}

          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '24px', background: '#d1fae5', border: '1px solid #34d399', borderRadius: 'var(--radius-sm)' }}>
            <CheckCircle2 color="#059669" size={40} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#065f46', marginBottom: '8px' }}>Password Successfully Reset!</h3>
            <p style={{ fontSize: '13px', color: '#047857', lineHeight: '1.5', marginBottom: '20px' }}>
              Your account password has been updated. You can now log into the portal.
            </p>
            <button className="tech-btn tech-btn-primary" onClick={() => navigate('/login')} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              Sign In to Your Account &rarr;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
