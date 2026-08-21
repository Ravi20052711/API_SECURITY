import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

export default function Footer({ navigate }) {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-subtle)', padding: '32px 24px', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        
        <div>
          <div className="sys-logo" onClick={() => navigate?.('/')} style={{ marginBottom: '12px' }}>
            <span className="sys-logo-icon">&gt;_</span>
            <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Deliberately vulnerable API security training system with guided exercises, independent oracle verification, and transfer-learning evaluation.
          </p>
        </div>

        <div>
          <h4 className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', marginBottom: '12px', fontWeight: '700' }}>[ NAVIGATION ]</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <li><button onClick={() => navigate?.('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Home</button></li>
            <li><button onClick={() => navigate?.('/modules')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Vulnerability Catalog</button></li>
            <li><button onClick={() => navigate?.('/assessment')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Transfer Assessment</button></li>
            <li><button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Documentation & FAQ</button></li>
          </ul>
        </div>

        <div>
          <h4 className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', marginBottom: '12px', fontWeight: '700' }}>[ SAFETY BOUNDARY ]</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '8px' }}>
            OWASP API Security Top 10 Aligned. Operates under isolated sandbox constraints.
          </p>
          <span className="tech-badge badge-green">AUTHORIZED LAB ONLY</span>
        </div>

        <div>
          <h4 className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', marginBottom: '12px', fontWeight: '700' }}>[ RESOURCES ]</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <a href="https://owasp.org/www-project-api-security/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ExternalLink size={12} />
              <span>OWASP API Security</span>
            </a>
            <a href="#github" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Github size={12} />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', marginTop: '24px', paddingTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }} className="mono">
        © 2026 HackTheAPI. All activities logged for research & verification.
      </div>
    </footer>
  );
}
