import React from 'react';

export default function Footer({ navigate }) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-surface-1)',
      marginTop: 'auto',
      padding: '32px 24px',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>APISEC BENCH</span>
          <span>• Precise Cybersecurity & Autonomous AI Agent Security Benchmarking</span>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => navigate('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
            Documentation
          </button>
          <button onClick={() => navigate('/assessment')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
            Transfer Lab
          </button>
          <button onClick={() => navigate('/progress')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
            Analytics
          </button>
        </div>
      </div>
    </footer>
  );
}
