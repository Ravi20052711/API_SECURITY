import React, { useState } from 'react';
import { ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { userAuth } from '../services/api';

export default function SignupPage({ navigate, setCurrentUser }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [institution, setInstitution] = useState('Department of Computer Science');
  const [ethicalConsent, setEthicalConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Password is required for account creation.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    if (!ethicalConsent) {
      setErrorMsg("You must agree to the Ethical Use Agreement before creating an account.");
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
    <div style={{ maxWidth: '520px', margin: '30px auto', width: '100%' }}>
      <div className="tech-card" style={{ padding: '36px' }}>
        
        {/* Logo */}
        <div className="sys-logo" onClick={() => navigate('/')} style={{ justifyContent: 'center', marginBottom: '24px', cursor: 'pointer' }}>
          <span className="sys-logo-icon">&gt;_</span>
          <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Create Your Account</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Register your credentials for authorized API exploitation training</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 'var(--radius-sm)', fontSize: '12px', marginBottom: '20px', fontWeight: '600' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Alice Chen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input 
              type="email"
              required
              placeholder="e.g. alice@university.edu"
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

          {/* Password Fields */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Create Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
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

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input 
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                <option value="student">Student / Learner</option>
                <option value="instructor">Instructor / Faculty</option>
                <option value="assessor">Assessor / Evaluator</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Institution
              </label>
              <input 
                type="text"
                placeholder="University / Organization"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Ethical Use Agreement */}
          <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#475569', cursor: 'pointer', lineHeight: '1.4' }}>
              <input 
                type="checkbox"
                checked={ethicalConsent}
                onChange={(e) => setEthicalConsent(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--brand-orange)' }}
              />
              <span>
                I agree to the <strong>Ethical Hacking Rules of Engagement</strong>. I will only perform API testing against authorized target containers.
              </span>
            </label>
          </div>

          <button 
            type="submit" 
            className="tech-btn tech-btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Creating Account & Saving Credentials...' : 'Create Account & Start Learning'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: 'var(--brand-orange)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Log in here
          </button>
        </div>

      </div>
    </div>
  );
}
