import React, { useState } from 'react';

export default function HomePage({ navigate, isAuthenticated }) {
  const [activeDemoTab, setActiveDemoTab] = useState('rest');

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', paddingBottom: '32px' }}>
      
      {/* Hero Section */}
      <section style={{ maxWidth: '880px', margin: '40px auto 0 auto', textAlign: 'center' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '16px', backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', marginBottom: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            BENCHMARK v2.4 • OWASP API & MCP AI AGENT SECURITY
          </span>
        </div>

        <h1 style={{
          fontSize: '42px',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          lineHeight: '1.2',
          color: 'var(--text-primary)',
          marginBottom: '20px'
        }}>
          Precision security benchmarking for APIs and Autonomous AI Agent Protocols.
        </h1>

        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          margin: '0 auto 32px auto'
        }}>
          An interactive laboratory for evaluating vulnerabilities across REST APIs and Model Context Protocol (MCP v1.0) servers. Practice exploitation in isolated Docker environments with automated verification.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="tech-btn tech-btn-primary tech-btn-lg" 
            onClick={handleAction}
          >
            {isAuthenticated ? 'Open Student Dashboard' : 'Start interactive labs'}
          </button>
          <button 
            className="tech-btn tech-btn-secondary tech-btn-lg" 
            onClick={() => navigate('/docs')}
          >
            Explore documentation
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

        <div className="tech-card">
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
            01 • Isolated Container Sandboxes
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Real Docker Targets</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Each laboratory module provisions a dedicated, ephemeral target container instance with live HTTP telemetry.
          </p>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
            02 • Independent State Verification
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Oracle Evaluation</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Outcomes are calculated via backend state assertions and assertion diffs without relying on user self-reporting.
          </p>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
            03 • AI Agentic Threat Vectors
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>MCP v1.0 Tool Injection</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Evaluate security posture against indirect prompt injection, unauthenticated tool execution, and resource exfiltration.
          </p>
        </div>

      </section>

    </div>
  );
}
