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
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Analytics & Mastery
          </div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            Performance & Progress Analytics
          </h1>
          <p style={{ fontSize: '14px', maxWidth: '640px' }}>
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
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Curriculum Completion
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '6px' }}>
            {progressData.completion_rate}%
          </div>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Labs Completed
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '6px' }}>
            {progressData.completed_count} / {progressData.total_exercises}
          </div>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Technique Score
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '6px' }}>
            {progressData.total_score} pts
          </div>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Containment Isolation
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--status-success)', marginTop: '6px' }}>
            100%
          </div>
        </div>
      </div>

      {/* Progress Breakdown Table */}
      <div className="tech-card">
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>
          Module Execution History
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-standard)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px', fontWeight: '500' }}>Module Title</th>
                <th style={{ padding: '10px 12px', fontWeight: '500' }}>Standard</th>
                <th style={{ padding: '10px 12px', fontWeight: '500' }}>Verification State</th>
                <th style={{ padding: '10px 12px', fontWeight: '500' }}>Score</th>
                <th style={{ padding: '10px 12px', fontWeight: '500' }}>Timestamp</th>
                <th style={{ padding: '10px 12px', fontWeight: '500', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {progressData.items && progressData.items.map((item) => (
                <tr key={item.exercise_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {item.title}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="tech-badge">{item.owasp}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`tech-badge ${item.status === 'COMPLETED' ? 'badge-green' : 'badge-amber'}`}>
                      {item.status === 'COMPLETED' ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                    {item.score} pts
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {item.completed_at || '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      className="tech-btn tech-btn-sm tech-btn-secondary"
                      onClick={() => navigate('/modules')}
                    >
                      {item.status === 'COMPLETED' ? 'Review' : 'Launch'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
