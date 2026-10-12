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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '32px' }}>
      
      {/* Hero Section */}
      <section style={{ maxWidth: '820px', margin: '32px auto 0 auto', textAlign: 'center' }}>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          letterSpacing: '-0.03em',
          lineHeight: '1.12',
          color: 'var(--text-primary)',
          marginBottom: '20px'
        }}>
          Precision security benchmarking for APIs and Autonomous AI Agent Protocols.
        </h1>

        <p style={{
          fontSize: '17px',
          lineHeight: '1.55',
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
            Read documentation
          </button>
        </div>
      </section>

      {/* Main Product Showcase Visual */}
      <section style={{
        maxWidth: '1080px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-standard)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        {/* Showcase Header Bar */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-2)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e5e5ea', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e5e5ea', display: 'inline-block' }}></span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e5e5ea', display: 'inline-block' }}></span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '8px' }}>
              Interactive Lab Workbench
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveDemoTab('rest')}
              style={{
                background: activeDemoTab === 'rest' ? 'var(--bg-surface-1)' : 'transparent',
                border: activeDemoTab === 'rest' ? '1px solid var(--border-standard)' : '1px solid transparent',
                borderRadius: 'var(--radius-xs)',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: activeDemoTab === 'rest' ? '600' : '400',
                color: activeDemoTab === 'rest' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              REST API Target (BFLA)
            </button>
            <button
              onClick={() => setActiveDemoTab('mcp')}
              style={{
                background: activeDemoTab === 'mcp' ? 'var(--bg-surface-1)' : 'transparent',
                border: activeDemoTab === 'mcp' ? '1px solid var(--border-standard)' : '1px solid transparent',
                borderRadius: 'var(--radius-xs)',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: activeDemoTab === 'mcp' ? '600' : '400',
                color: activeDemoTab === 'mcp' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              MCP Protocol Target (Tool Injection)
            </button>
          </div>
        </div>

        {/* Showcase Body Preview */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left: Request Construction */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {activeDemoTab === 'rest' ? 'HTTP Request Builder' : 'JSON-RPC 2.0 MCP Message'}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                padding: '6px 10px',
                backgroundColor: activeDemoTab === 'rest' ? 'var(--status-danger-bg)' : 'var(--accent-subtle)',
                color: activeDemoTab === 'rest' ? 'var(--status-danger)' : 'var(--accent-primary)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '12px',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)'
              }}>
                {activeDemoTab === 'rest' ? 'DELETE' : 'POST'}
              </span>
              <input 
                type="text" 
                readOnly 
                value={activeDemoTab === 'rest' ? '/api/v1/users/carlos' : '/mcp/v1/tools/call'} 
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Headers</div>
              <pre style={{
                backgroundColor: 'var(--bg-surface-3)',
                padding: '10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                margin: 0
              }}>
                {activeDemoTab === 'rest' 
                  ? 'Authorization: Bearer token_wiener_9941\nContent-Type: application/json'
                  : 'Content-Type: application/json\nX-MCP-Protocol-Version: 2024-11-05'}
              </pre>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Payload Body</div>
              <pre style={{
                backgroundColor: 'var(--bg-surface-3)',
                padding: '10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                margin: 0,
                minHeight: '80px'
              }}>
                {activeDemoTab === 'rest'
                  ? '{\n  "reason": "Administrative deletion request"\n}'
                  : '{\n  "jsonrpc": "2.0",\n  "method": "tools/call",\n  "params": {\n    "name": "system_exec",\n    "arguments": { "command": "cat /etc/passwd" }\n  }\n}'}
              </pre>
            </div>
          </div>

          {/* Right: Live Telemetry & Verification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Server Response & Oracle Engine
              </span>
              <span className="tech-badge badge-green">
                Status: 200 OK (Exploit Verified)
              </span>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Target Response Body</div>
              <pre style={{
                backgroundColor: 'var(--bg-surface-3)',
                padding: '10px',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                margin: 0,
                minHeight: '120px'
              }}>
                {activeDemoTab === 'rest'
                  ? '{\n  "status": "success",\n  "deleted_user": "carlos",\n  "executed_by": "wiener (role: standard)",\n  "warning": "Unprotected admin function invoked"\n}'
                  : '{\n  "jsonrpc": "2.0",\n  "result": {\n    "toolResult": "root:x:0:0:root:/root:/bin/bash...",\n    "isError": false\n  }\n}'}
              </pre>
            </div>

            <div style={{
              backgroundColor: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                Oracle Verification Logic
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {activeDemoTab === 'rest'
                  ? 'Verified: Low-privileged account wiener deleted target carlos without administrative authorization tokens.'
                  : 'Verified: Autonomous agent executed unsanitized system_exec tool call triggered by untrusted parameter injection.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Coverage: REST API Security & MCP Protocols */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>
            Structured laboratory curriculum
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>
            Hands-on vulnerability modules covering both classical API weaknesses and emerging agentic protocol threats.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Track 1 */}
          <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span className="tape-strip"></span>
            <div>
              <span className="tech-badge badge-blue" style={{ marginBottom: '14px' }}>
                Track 1 • OWASP API Security Top 10
              </span>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
                Modern Web & Mobile REST API Flaws
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                Identify and exploit authorization and parameter tampering flaws across containerized microservices.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <li>• Broken Object Level Authorization (BOLA / API1)</li>
                <li>• Broken Object Property Level Authorization (BOPLA / API3)</li>
                <li>• Broken Function Level Authorization (BFLA / API5)</li>
                <li>• Server-Side Request Forgery (SSRF / API7)</li>
              </ul>
            </div>
            <button 
              className="tech-btn tech-btn-secondary" 
              style={{ marginTop: '24px', width: '100%' }}
              onClick={() => navigate('/modules')}
            >
              Explore REST API labs
            </button>
          </div>

          {/* Track 2 */}
          <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span className="thumbtack-pin"></span>
            <div>
              <span className="tech-badge badge-amber" style={{ marginBottom: '14px' }}>
                Track 2 • Model Context Protocol (MCP v1.0)
              </span>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
                Autonomous AI Agent Protocol Security
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                Benchmark protocol vulnerabilities arising when autonomous AI agents invoke external tools and inspect data resources.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <li>• Indirect Prompt Injection via MCP Resources</li>
                <li>• Broken Tool-Level Authorization (Agentic BFLA)</li>
                <li>• Tool Argument Injection & Poisoning</li>
                <li>• Confused Deputy in Multi-Agent Trajectories</li>
              </ul>
            </div>
            <button 
              className="tech-btn tech-btn-secondary" 
              style={{ marginTop: '24px', width: '100%' }}
              onClick={() => navigate('/modules')}
            >
              Explore MCP Agentic labs
            </button>
          </div>
        </div>
      </section>

      {/* Scientific Measurement & Ground Truth */}
      <section style={{
        maxWidth: '1080px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px'
      }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Ground-Truth Evaluation
          </div>
          <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>
            Activity-driven scoring with Hake's Normalized Gain.
          </h2>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Unlike platforms that award points for viewing a page, our Oracle Engine inspects actual HTTP and JSON-RPC traffic. The 5-stage workflow measures conceptual knowledge gain before and after practical training.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-3)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>1. Baseline Pre-Test</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>8 conceptual domain questions prior to training</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-3)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>2. Guided Labs</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Docker target exploitation with HTTP builder</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-3)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>3. Parallel Post-Test</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Equivalent parallel questions measuring gain</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-3)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>4. Transfer Lab</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Unassisted testing on blind target schemas</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-3)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>5. Usability (SUS)</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Standardized platform experience metric</div>
          </div>
        </div>
      </section>

      {/* Role-Based Pathways */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Designed for university and enterprise research</h2>
          <p>Role-specific workspaces provide tailored telemetry, audit trails, and configuration tools.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="tech-card">
            <span className="tape-strip"></span>
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>Students & Learners</div>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Launch guided Docker containers, practice exploitation techniques, and receive adaptive assistance from Qwen AI.
            </p>
          </div>

          <div className="tech-card">
            <span className="thumbtack-pin"></span>
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>University Instructors</div>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Track student cohort progress, monitor average normalized knowledge gains, and view live lab completion rates.
            </p>
          </div>

          <div className="tech-card">
            <span className="tape-strip"></span>
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>Security Assessors</div>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Inspect immutable HTTP request and response evidence logs to verify genuine exploit mechanics.
            </p>
          </div>

          <div className="tech-card">
            <span className="thumbtack-pin"></span>
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>AI Researchers</div>
            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Benchmark autonomous AI agent tool-calling trajectories against vulnerable MCP v1.0 server endpoints.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Quiet Callout */}
      <section style={{
        maxWidth: '1080px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: 'var(--text-primary)',
        color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 40px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'var(--text-inverse)', fontSize: '32px', marginBottom: '12px' }}>
          Start training in the laboratory
        </h2>
        <p style={{ color: '#d2d2d7', fontSize: '15px', maxWidth: '520px', margin: '0 auto 28px auto' }}>
          Create an account to begin the 5-stage conceptual assessment and launch your first containerized exercise.
        </p>
        <button 
          className="tech-btn tech-btn-accent tech-btn-lg"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
        >
          {isAuthenticated ? 'Open Student Dashboard' : 'Create academic account'}
        </button>
      </section>

    </div>
  );
}
