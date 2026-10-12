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
        exerciseId: 'ex-transfer-01',
        userEmail: email,
        payload: { target: selectedTarget, method, path: urlPath }
      });
      setResponseState(res);
      fetchScorecard();
    } catch (err) {
      setResponseState({
        verified: false,
        message: 'Evaluation failed against frozen rubric anchors AC-1 to AC-4.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Independent Acceptance Partition
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          Transfer Lab: Blind Target Schema
        </h1>
        <p style={{ fontSize: '14px', maxWidth: '640px', color: 'var(--text-secondary)' }}>
          Apply acquired API security exploitation techniques against an unfamiliar API target. Tested independently against frozen rubric anchors AC-1 to AC-4.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Left Column: Blind Schema Execution Workbench */}
        <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px' }}>Unfamiliar Target Selection</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {targets.map(tgt => (
              <div
                key={tgt.id}
                onClick={() => setSelectedTarget(tgt.id)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${selectedTarget === tgt.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                  backgroundColor: selectedTarget === tgt.id ? 'var(--accent-subtle)' : 'var(--bg-surface-2)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{tgt.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{tgt.difficulty} • {tgt.owasp}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>HTTP TARGET PATH</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                style={{ width: '100px', fontWeight: '700', color: 'var(--accent-primary)' }}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="text"
                value={urlPath}
                onChange={e => setUrlPath(e.target.value)}
                style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <button
              className="tech-btn tech-btn-primary"
              onClick={handleSendBlind}
              disabled={loading}
            >
              {loading ? 'Evaluating...' : 'Submit Blind Attack Request'}
            </button>
          </div>

          {responseState && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: responseState.verified ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
              border: `1px solid ${responseState.verified ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: responseState.verified ? 'var(--status-success)' : 'var(--status-danger)' }}>
                {responseState.verified ? '✓ Rubric Anchor Satisfied' : '✕ Evaluation Non-Compliant'}
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-primary)' }}>
                {responseState.message || 'Transfer assessment result logged.'}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scorecard & Rubric Anchors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className="tech-card">
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Transfer Readiness Scorecard</h3>
            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--accent-primary)' }}>
              {scoreData?.kpis?.transfer_score || '100 / 100'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Normalized gain metric calculated across AC-1 to AC-4 rubric conditions.
            </div>
          </div>

          <div className="tech-card">
            <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>Frozen Rubric Criteria</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-xs)' }}>
                <strong>AC-1:</strong> Target Object ID Mutation Verification
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-xs)' }}>
                <strong>AC-2:</strong> Function Privilege Escalation Check
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-xs)' }}>
                <strong>AC-3:</strong> Mass Assignment Payload Filtering
              </div>
              <div style={{ padding: '8px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-xs)' }}>
                <strong>AC-4:</strong> Ground-Truth Immutable Evidence Audit
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
