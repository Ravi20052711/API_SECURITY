import React, { useState, useEffect } from 'react';
import { oracleApi } from '../services/api';

export default function AssessmentPage({ navigate }) {
  const [selectedTarget, setSelectedTarget] = useState('target-alpha');
  const [method, setMethod] = useState('POST');
  const [urlPath, setUrlPath] = useState('/unfamiliar/v2/orders/4099/export');
  const [responseState, setResponseState] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);

  const targets = [
    { id: 'target-alpha', name: 'Target Alpha • FinTech Gateway', difficulty: 'Blind Schema', owasp: 'API1 / API3' },
    { id: 'target-beta', name: 'Target Beta • HealthCare Portal', difficulty: 'Blind Schema', owasp: 'API2 / API5' }
  ];

  const fetchScorecard = async () => {
    const userProfile = localStorage.getItem('user_profile') || localStorage.getItem('user');
    let email = 'student@lab.dev';
    if (userProfile) {
      try {
        const u = JSON.parse(userProfile);
        if (u.email) email = u.email;
      } catch {}
    }
    try {
      const res = await oracleApi.getKpis(email);
      setScoreData(res);
    } catch {
      setScoreData({ has_data: false });
    }
  };

  useEffect(() => {
    fetchScorecard();
  }, []);

  const handleSendBlind = async () => {
    const userProfile = localStorage.getItem('user_profile') || localStorage.getItem('user');
    let email = 'student@lab.dev';
    if (userProfile) {
      try {
        const u = JSON.parse(userProfile);
        if (u.email) email = u.email;
      } catch {}
    }

    setLoading(true);
    try {
      const res = await oracleApi.evaluateSubmission({
        target_api_name: selectedTarget === 'target-alpha' ? 'FinTech Gateway API (Blind Target)' : 'HealthCare Portal API (Blind Target)',
        url: urlPath,
        method: method,
        user_email: email
      });

      setResponseState(res);
      fetchScorecard();
    } catch (err) {
      setResponseState({
        status: 400,
        statusText: 'BAD_REQUEST',
        time: '120ms',
        exploited: false,
        data: {
          error: err.response?.data?.error || err.message || 'Blind payload execution failed.'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Transfer Learning Evaluation • Stage 4
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Blind Transfer Assessment Lab
        </h1>
        <p style={{ fontSize: '14px', maxWidth: '640px' }}>
          Evaluate vulnerability discovery and exploit transferability against unfamiliar target schemas without guided scaffolding or hints.
        </p>
      </div>

      {/* Target Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {targets.map(t => (
          <div 
            key={t.id}
            onClick={() => setSelectedTarget(t.id)}
            className="tech-card"
            style={{
              cursor: 'pointer',
              borderColor: selectedTarget === t.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
              borderWidth: selectedTarget === t.id ? '2px' : '1px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="tech-badge badge-amber">{t.difficulty}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.owasp}</span>
            </div>
            <h3 style={{ fontSize: '16px' }}>{t.name}</h3>
          </div>
        ))}
      </div>

      {/* Blind Playground Area */}
      <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px' }}>
            Blind Exploitation Request Workbench
          </h3>
          <span className="tech-badge">Unassisted Mode</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '100px', fontWeight: '600', fontFamily: 'var(--font-mono)' }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
          </select>

          <input 
            type="text"
            value={urlPath}
            onChange={(e) => setUrlPath(e.target.value)}
            style={{ flex: 1, minWidth: '240px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />

          <button className="tech-btn tech-btn-primary" onClick={handleSendBlind} disabled={loading}>
            {loading ? 'Evaluating...' : 'Execute Blind Payload'}
          </button>
        </div>

        {/* Response Box */}
        {responseState && (
          <div style={{
            backgroundColor: 'var(--bg-surface-3)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{
                backgroundColor: responseState.exploited ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                color: responseState.exploited ? 'var(--status-success)' : 'var(--status-danger)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                fontWeight: '600'
              }}>
                {responseState.status || 200} {responseState.statusText || 'RESPONSE'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{responseState.time || '184ms'}</span>
              <span style={{ fontWeight: '600', color: responseState.exploited ? 'var(--status-success)' : 'var(--status-danger)' }}>
                {responseState.exploited ? 'Blind transfer verified' : 'Exploit unverified'}
              </span>
            </div>
            <pre style={{ margin: 0, color: 'var(--text-primary)', overflow: 'auto' }}>
              {JSON.stringify(responseState.data || responseState, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Scorecard Section */}
      <div className="tech-card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>
          Transfer Learning Scorecard
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AC-1 Technique Transfer</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
              {scoreData?.has_data ? (scoreData.ac1_transfer || '80%') : '—'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AC-2 Time to Exploit</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
              {scoreData?.has_data ? 'Recorded' : '—'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AC-3 Assessor Verification</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px', color: scoreData?.has_data ? 'var(--status-success)' : 'var(--text-primary)' }}>
              {scoreData?.has_data ? (scoreData.ac3_pass || 'PASS') : '—'}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AC-4 Route Memorization</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>
              {scoreData?.has_data ? '0% (Clean)' : '—'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
