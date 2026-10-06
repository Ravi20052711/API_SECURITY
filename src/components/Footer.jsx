import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

export default function Footer({ navigate }) {
  return (
    <footer style={{ background: '#0a0a0c', borderTop: '1px solid #1e293b', color: '#ffffff', padding: '40px 24px 24px 24px', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
        
        {/* Column 1: Terms & Privacy */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', letterSpacing: '0.5px' }}>
            TERMS & PRIVACY
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#94a3b8' }}>
            <li>
              <button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: '12px' }}>
                Terms of Use
              </button>
            </li>
            <li>
              <button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: '12px' }}>
                Privacy Notice
              </button>
            </li>
            <li>
              <button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: '12px' }}>
                Ethical Rules of Engagement
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: CONTACT */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', letterSpacing: '0.5px' }}>
            CONTACT
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <div>
              Helpline Number (HackTheAPI): <span style={{ color: '#ffffff', fontWeight: '600' }}>1800 572 3858</span>
              <br /><span style={{ fontSize: '11px', color: '#64748b' }}>( India Toll Free )</span>
            </div>
            <div style={{ marginTop: '4px' }}>
              Helpline Number (IT Support): <span style={{ color: '#ffffff', fontWeight: '600' }}>1800 209 3111</span>
              <br /><span style={{ fontSize: '11px', color: '#64748b' }}>( India Toll Free )</span>
            </div>
          </div>
        </div>

        {/* Column 3: QUERIES */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', letterSpacing: '0.5px' }}>
            QUERIES
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <div>E-mail (Support): <a href="mailto:support@hacktheapi.dev" style={{ color: '#ffffff', textDecoration: 'none' }}>support@hacktheapi.dev</a></div>
            <div>E-mail (IT): <a href="mailto:careers@hacktheapi.dev" style={{ color: '#ffffff', textDecoration: 'none' }}>careers@hacktheapi.dev</a></div>
            <div>E-mail (Lab Ops): <a href="mailto:campus.support1@hacktheapi.dev" style={{ color: '#ffffff', textDecoration: 'none' }}>campus.support1@hacktheapi.dev</a></div>
          </div>
        </div>

        {/* Column 4: Follow Us */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', marginBottom: '16px', letterSpacing: '0.5px' }}>
            Follow Us
          </h4>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {[
              { icon: 'f', label: 'Facebook' },
              { icon: 'X', label: 'Twitter/X' },
              { icon: 'in', label: 'LinkedIn' },
              { icon: 'yt', label: 'YouTube' }
            ].map((s, idx) => (
              <div 
                key={idx}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                title={s.label}
              >
                {s.icon}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ maxWidth: '1400px', margin: '32px auto 0 auto', paddingTop: '20px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#64748b' }}>
        <div>© 2026 HackTheAPI. All Rights Reserved. Authorized Security Research Lab.</div>
        <div className="mono" style={{ color: 'var(--brand-orange)' }}>// OWASP API SECURITY TOP 10 INTEGRATED PLATFORM</div>
      </div>
    </footer>
  );
}
