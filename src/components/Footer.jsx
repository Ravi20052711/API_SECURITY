import React from 'react';

export default function Footer({ navigate }) {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-canvas)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 24px 36px 24px',
      marginTop: 'auto',
      fontSize: '12px',
      color: 'var(--text-muted)'
    }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          paddingBottom: '36px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', fontSize: '13px' }}>
              API_SECURITY Platform
            </div>
            <p style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              Interactive hands-on training, assessment, and benchmarking environment for API security flaws and Autonomous AI Agent Protocols (Model Context Protocol / MCP v1.0).
            </p>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Autonomous Protocol Security Research
            </div>
          </div>

          <div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', fontSize: '13px' }}>
              Curriculum & Labs
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
              <li><button onClick={() => navigate?.('/modules')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>OWASP API Security Top 10</button></li>
              <li><button onClick={() => navigate?.('/modules')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>MCP Agentic Protocol Flaws</button></li>
              <li><button onClick={() => navigate?.('/assessment')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Blind Transfer Assessment</button></li>
              <li><button onClick={() => navigate?.('/pre-test')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Baseline Pre-Test</button></li>
              <li><button onClick={() => navigate?.('/post-test')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Knowledge Gain Post-Test</button></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', fontSize: '13px' }}>
              Documentation & Specifications
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
              <li><button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Platform Documentation</button></li>
              <li><button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>MCP v1.0 JSON-RPC Specification</button></li>
              <li><button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Oracle Verification Engine</button></li>
              <li><button onClick={() => navigate?.('/usability')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>System Usability Survey</button></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px', fontSize: '13px' }}>
              Academic & Governance
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
              <li><button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Ethical Hacking Agreement</button></li>
              <li><button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Terms of Service (Academic Draft)</button></li>
              <li><button onClick={() => navigate?.('/docs')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '12px' }}>Privacy Policy (Telemetry & Logs)</button></li>
              <li><span style={{ color: 'var(--status-success)', fontSize: '11px', fontWeight: '500' }}>Oracle Engine: Online</span></li>
            </ul>
          </div>
        </div>

        <div style={{
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '11px'
        }}>
          <div>
            © 2026 API_SECURITY Platform. All rights reserved.
          </div>
          <div>
            Research Edition • Model Context Protocol v1.0 Aligned
          </div>
        </div>
      </div>
    </footer>
  );
}
