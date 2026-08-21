import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { userAuth } from '../services/api';

export default function SignupPage({ navigate, setCurrentUser }) {
  const [fullName, setFullName] = useState('Alex River');
  const [email, setEmail] = useState('alex@university.edu');
  const [role, setRole] = useState('student');
  const [institution, setInstitution] = useState('Department of Computer Science');
  const [ethicalConsent, setEthicalConsent] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!ethicalConsent) {
      alert("You must agree to the Ethical Use Agreement before creating an account.");
      return;
    }

    setLoading(true);
    try {
      const parts = fullName.split(' ');
      const res = await userAuth.signup({
        username: email,
        email: email,
        password: 'password123',
        first_name: parts[0] || 'Alex',
        last_name: parts.slice(1).join(' ') || 'River',
        role: role,
        institution: institution,
        ethical_agreement_accepted: ethicalConsent
      });

      setCurrentUser(res.user);
      navigate('/dashboard');
    } catch (err) {
      // Fallback for seamless offline presentation
      setCurrentUser({
        name: fullName,
        email: email,
        role: role
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '30px auto', width: '100%' }}>
      <div className="tech-card" style={{ padding: '36px' }}>
        
        {/* Logo */}
        <div className="sys-logo" onClick={() => navigate('/')} style={{ justifyContent: 'center', marginBottom: '24px' }}>
          <span className="sys-logo-icon">&gt;_</span>
          <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>Create Your Account</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Register your profile for authorized API exploitation training</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Full Name
            </label>
            <input 
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <input 
              type="email"
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
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Select User Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                className={`tech-btn tech-btn-sm ${role === 'student' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button 
                type="button"
                className={`tech-btn tech-btn-sm ${role === 'instructor' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
                onClick={() => setRole('instructor')}
              >
                Instructor
              </button>
              <button 
                type="button"
                className={`tech-btn tech-btn-sm ${role === 'assessor' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
                onClick={() => setRole('assessor')}
              >
                Assessor
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Institution / Organization (Optional)
            </label>
            <input 
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
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

          {/* Mandatory Ethical Consent */}
          <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '12px', color: '#9a3412' }}>
              <input 
                type="checkbox" 
                checked={ethicalConsent}
                onChange={(e) => setEthicalConsent(e.target.checked)}
                style={{ marginTop: '2px' }}
              />
              <span>
                <strong>Ethical Hacking Agreement (Mandatory):</strong> I certify that I will use this platform strictly for authorized educational research against local synthetic fixtures.
              </span>
            </label>
          </div>

          <button type="submit" className="tech-btn tech-btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }} disabled={loading}>
            <span>{loading ? 'Creating Account via Axios...' : 'Create Profile & Enter Console'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          Already registered?{' '}
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--brand-navy)', fontWeight: '700', cursor: 'pointer' }}>
            Sign In Here
          </button>
        </div>

      </div>
    </div>
  );
}
