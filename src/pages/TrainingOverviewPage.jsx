import React from 'react';
import { BookOpen, ShieldCheck, ArrowRight, Award, Zap, Code } from 'lucide-react';

export default function TrainingOverviewPage({ navigate }) {
  const trainingModules = [
    { id: 'ex-bola-01', title: 'Broken Object Level Authorization (BOLA)', code: 'API1:2023', level: 'Apprentice', duration: '20m', desc: 'Exploit authorization checks by modifying resource identifiers in API paths.' },
    { id: 'ex-bfla-01', title: 'Broken Function Level Authorization (BFLA)', code: 'API2:2023', level: 'Apprentice', duration: '20m', desc: 'Invoke administrative endpoints from unprivileged role contexts.' },
    { id: 'ex-mass-01', title: 'Mass Assignment Property Injection', code: 'API3:2023', level: 'Practitioner', duration: '25m', desc: 'Inject unauthorized role properties into profile JSON payloads.' },
    { id: 'ex-ssrf-01', title: 'Server-Side Request Forgery Metadata Leak', code: 'API7:2023', level: 'Practitioner', duration: '25m', desc: 'Force internal loopback metadata requests through image avatar inputs.' }
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '40px' }}>
      
      {/* Title Header */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // STEP 2 OF 5 • HANDS-ON OWASP API SECURITY TRAINING
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Interactive Lab Training Modules
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Practice vulnerability exploitation against real isolated Docker containers with real-time AI assistant guidance.
        </p>
      </div>

      {/* Modules List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {trainingModules.map(m => (
          <div key={m.id} className="tech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="tech-badge badge-cyan">{m.code}</span>
                <span className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>⏱️ {m.duration}</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{m.title}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{m.desc}</p>
            </div>

            <button className="tech-btn tech-btn-secondary" onClick={() => navigate(`/exercise?id=${m.id}`)}>
              <span>Launch Lab Target</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="tech-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#9a3412' }}>Completed Training?</h4>
          <p style={{ fontSize: '12px', color: '#c2410c' }}>Take the Post-Test Conceptual Assessment to measure your knowledge gain.</p>
        </div>
        <button className="tech-btn tech-btn-primary" onClick={() => navigate('/post-test')}>
          <span>Proceed to Post-Test</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}
