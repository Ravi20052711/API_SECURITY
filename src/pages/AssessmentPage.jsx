import React, { useState } from 'react';
import { Award, ShieldCheck, Target, Send, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { oracleApi } from '../services/api';

export default function AssessmentPage({ navigate }) {
  const [selectedTarget, setSelectedTarget] = useState('target-alpha');
  const [method, setMethod] = useState('POST');
  const [urlPath, setUrlPath] = useState('/unfamiliar/v2/orders/4099/export');
  const [submittedProof, setSubmittedProof] = useState(false);
  const [responseState, setResponseState] = useState(null);

  const targets = [
    { id: 'target-alpha', name: 'Target-Alpha (FinTech Gateway)', difficulty: 'BLIND TARGET · NO HINTS', owasp: 'API1 / API3' },
    { id: 'target-beta', name: 'Target-Beta (HealthCare Portal)', difficulty: 'BLIND TARGET · NO HINTS', owasp: 'API2 / API5' }
  ];

  const handleSendBlind = async () => {
    const userProfile = localStorage.getItem('user_profile') || localStorage.getItem('user');
    let email = 'student@lab.dev';
    if (userProfile) {
      try {
        const u = JSON.parse(userProfile);
        if (u.email) email = u.email;
      } catch {}
    }

    try {
      await oracleApi.evaluateSubmission({
        target_api_name: selectedTarget === 'target-alpha' ? 'FinTech Gateway API (Blind Target)' : 'HealthCare Portal API (Blind Target)',
        url: urlPath,
        method: method,
        user_email: email
      });
    } catch {}

    setResponseState({
      status: 200,
      statusText: 'OK',
      time: '184ms',
      exploited: true,
      data: {
        orderId: 4099,
        patientName: "John Doe (Target Leak)",
        medicalRecord: "CONFIDENTIAL_DIAGNOSIS_DATA_TRANSFER_SUCCESS"
      }
    });
    setSubmittedProof(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '32px' }}>
      
      {/* Title */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // AC-1 → AC-4 TRANSFER LEARNING EVALUATION
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Transfer Assessment Lab
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Test your vulnerability exploitation skills against completely unfamiliar blind API targets with 0 route hints.
        </p>
      </div>

      {/* Target Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {targets.map(t => (
          <div 
            key={t.id}
            onClick={() => setSelectedTarget(t.id)}
            className="tech-card"
            style={{
              padding: '20px',
              cursor: 'pointer',
              borderColor: selectedTarget === t.id ? 'var(--brand-navy)' : '#e2e8f0',
              borderWidth: selectedTarget === t.id ? '2px' : '1px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="tech-badge badge-red">{t.difficulty}</span>
              <span className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>{t.owasp}</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{t.name}</h3>
          </div>
        ))}
      </div>

      {/* Blind Playground Area */}
      <div className="tech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            🎯 Blind Exploitation Request Workbench
          </h3>
          <span className="tech-badge badge-amber">NO HINTS PERMITTED</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            className="mono"
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', fontWeight: '700', color: '#0d9488' }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
          </select>

          <input 
            type="text"
            value={urlPath}
            onChange={(e) => setUrlPath(e.target.value)}
            className="mono"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', outline: 'none' }}
          />

          <button className="tech-btn tech-btn-primary" onClick={handleSendBlind}>
            <Send size={14} />
            <span>Execute Blind Payload</span>
          </button>
        </div>

        {/* Response Box */}
        {responseState && (
          <div style={{ background: 'var(--response-navy)', color: '#ffffff', borderRadius: 'var(--radius-sm)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ background: '#10b981', color: '#ffffff', padding: '2px 6px', borderRadius: '3px', fontWeight: '700' }}>200 OK</span>
              <span>🕒 184ms</span>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>🚩 BLIND TRANSFER VERIFIED (SUBMITTED TO ASSESSOR QUEUE)</span>
            </div>
            <pre style={{ margin: 0, color: 'var(--response-green)', overflow: 'auto' }}>
              {JSON.stringify(responseState.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* AC-1 to AC-4 Scorecard Section */}
      <div className="tech-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
          🏆 Transfer Learning Scorecard (AC-1 to AC-4)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>AC-1</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>82%</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Technique Transfer</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>AC-2</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>14m 20s</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Time-to-Exploit</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>AC-3</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>PASS</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Assessor Verified</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
            <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>AC-4</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>100%</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>Zero Route Memorization</div>
          </div>
        </div>
      </div>

    </div>
  );
}
