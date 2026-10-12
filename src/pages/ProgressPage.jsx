import React, { useState, useEffect } from 'react';
import { exerciseApi } from '../services/api';

export default function ProgressPage({ navigate }) {
  const [progressData, setProgressData] = useState({
    completed_count: 1,
    total_exercises: 4,
    completion_rate: 25,
    total_score: 100,
    items: []
  });

  useEffect(() => {
    const userProfile = localStorage.getItem('user_profile');
    let email = 'student@lab.dev';
    if (userProfile) {
      try {
        const u = JSON.parse(userProfile);
        if (u.email) email = u.email;
      } catch {}
    }

    exerciseApi.getStudentProgress(email)
      .then(res => {
        if (res) setProgressData(res);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Analytics & Mastery
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
            Performance & Progress Analytics
          </h1>
          <p style={{ fontSize: '14px', maxWidth: '640px', color: 'var(--text-secondary)' }}>
            Detailed breakdown of completed laboratory modules, ground-truth verification scores, and technique mastery.
          </p>
        </div>

        <button className="tech-btn tech-btn-secondary" onClick={() => window.print()}>
          Export report
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completion Rate</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>{progressData.completion_rate}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{progressData.completed_count} of {progressData.total_exercises} modules</div>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transfer Score</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '8px' }}>{progressData.total_score} pts</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Verified Oracle ground truth</div>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Curriculum Status</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--status-success)', marginTop: '12px' }}>In Progress</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Next: Transfer Assessment</div>
        </div>
      </div>

      {/* Progress Breakdown Table */}
      <div className="tech-card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Verified Module Progression</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(progressData.items || []).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title || item.lab_id}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.owasp || 'OWASP API TOP 10'}</div>
              </div>
              <span className={`tech-badge ${item.status === 'COMPLETED' ? 'badge-green' : 'badge-amber'}`}>
                {item.status === 'COMPLETED' ? 'Verified' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
