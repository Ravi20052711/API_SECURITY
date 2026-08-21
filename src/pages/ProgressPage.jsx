import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, ShieldCheck, Clock, Award, CheckCircle, PlayCircle, Circle } from 'lucide-react';
import { exerciseApi } from '../services/api';

export default function ProgressPage({ navigate }) {
  const [progressData, setProgressData] = useState({
    completed_count: 1,
    total_exercises: 4,
    completion_rate: 25,
    total_score: 100,
    items: []
  });
  const [loading, setLoading] = useState(true);

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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
            // PERSONAL LEARNING TRACKER • DYNAMIC DATA
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Student Progress & Analytics
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Track your hands-on vulnerability completion, score, and OWASP API Security Top 10 mastery.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => window.print()}>
            <Download size={12} />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="tech-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{progressData.completion_rate}%</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Overall Completion</div>
        </div>

        <div className="tech-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎯</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            {progressData.completed_count} / {progressData.total_exercises}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Labs Completed</div>
        </div>

        <div className="tech-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-orange)' }}>{progressData.total_score} pts</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Total Score</div>
        </div>

        <div className="tech-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🛡️</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>100%</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Safety Containment</div>
        </div>
      </div>

      {/* Progress Breakdown Table */}
      <div className="tech-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          OWASP Module Completion Breakdown
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '12px 16px' }}>VULNERABILITY LAB</th>
              <th style={{ padding: '12px 16px' }}>OWASP CODE</th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px' }}>SCORE</th>
              <th style={{ padding: '12px 16px' }}>COMPLETED AT</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {progressData.items && progressData.items.map((item) => (
              <tr key={item.exercise_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                  {item.title}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className="tech-badge badge-cyan">{item.owasp}</span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {item.status === 'COMPLETED' ? (
                    <span style={{ color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} /> Completed
                    </span>
                  ) : item.status === 'IN_PROGRESS' ? (
                    <span style={{ color: '#ea580c', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PlayCircle size={14} /> In Progress
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Circle size={14} /> Not Started
                    </span>
                  )}
                </td>
                <td className="mono" style={{ padding: '14px 16px', fontWeight: '700', color: item.score > 0 ? '#10b981' : '#64748b' }}>
                  {item.score} pts
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                  {item.completed_at || '—'}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <button 
                    className="tech-btn tech-btn-sm tech-btn-secondary"
                    onClick={() => navigate('/modules')}
                  >
                    {item.status === 'COMPLETED' ? 'Review Lab' : 'Launch Lab'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
