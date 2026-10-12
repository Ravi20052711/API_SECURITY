import React from 'react';

export default function TrainingOverviewPage({ navigate }) {
  const trainingModules = [
    { id: 'ex-bola-01', title: 'Broken Object Level Authorization (BOLA)', code: 'API1:2023', level: 'Apprentice', duration: '20 min', desc: 'Exploit authorization checks by modifying resource identifiers in API paths.' },
    { id: 'ex-bfla-01', title: 'Broken Function Level Authorization (BFLA)', code: 'API2:2023', level: 'Apprentice', duration: '20 min', desc: 'Invoke administrative endpoints from unprivileged role contexts.' },
    { id: 'ex-mass-01', title: 'Mass Assignment Property Injection', code: 'API3:2023', level: 'Practitioner', duration: '25 min', desc: 'Inject unauthorized role properties into profile JSON payloads.' },
    { id: 'ex-ssrf-01', title: 'Server-Side Request Forgery Metadata Leak', code: 'API7:2023', level: 'Practitioner', duration: '25 min', desc: 'Force internal loopback metadata requests through image avatar inputs.' }
  ];

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Step 2 of 5 • Guided Practice
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Interactive Lab Training Modules
        </h1>
        <p style={{ fontSize: '14px', maxWidth: '640px' }}>
          Practice vulnerability exploitation against isolated Docker containers with real-time HTTP interception and assistance.
        </p>
      </div>

      {/* Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {trainingModules.map(m => (
          <div key={m.id} className="tech-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="tech-badge badge-blue">{m.code}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.duration}</span>
              </div>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{m.title}</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{m.desc}</p>
            </div>

            <button className="tech-btn tech-btn-secondary" onClick={() => navigate(`/exercise?id=${m.id}`)}>
              Launch Lab Target
            </button>
          </div>
        ))}
      </div>

      {/* Next Step Banner */}
      <div className="tech-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>Ready for Knowledge Evaluation?</h4>
          <p style={{ fontSize: '13px', margin: 0 }}>Take the Post-Test Conceptual Assessment to measure your normalized learning gain.</p>
        </div>
        <button className="tech-btn tech-btn-primary" onClick={() => navigate('/post-test')}>
          Proceed to Step 3: Post-Test
        </button>
      </div>

    </div>
  );
}
