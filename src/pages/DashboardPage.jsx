import React, { useState, useEffect } from 'react';
import { exerciseApi, labApi } from '../services/api';

export default function DashboardPage({ navigate }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_profile') || localStorage.getItem('user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [dashboardData, setDashboardData] = useState({
    user: currentUser,
    active_lab_session: null,
    stats: {
      completed_count: 0,
      total_exercises: 6,
      completion_rate: 0,
      total_score: 0
    },
    progress_items: [],
    recent_activity: [],
    badges: []
  });

  const [loading, setLoading] = useState(true);
  const [launchingExId, setLaunchingExId] = useState(null);
  const [dockerErrorMsg, setDockerErrorMsg] = useState(null);

  useEffect(() => {
    exerciseApi.getDashboardMe()
      .then(data => {
        if (data) {
          setDashboardData(data);
          if (data.user) setCurrentUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboardData.stats || { completed_count: 0, total_exercises: 6, completion_rate: 0, total_score: 0 };
  const items = dashboardData.progress_items || [];
  const activeSess = dashboardData.active_lab_session;
  const recentActivity = dashboardData.recent_activity || [];

  const handleContinueActiveLab = async () => {
    const exId = activeSess ? activeSess.exerciseId : 'ex-bfla-01';
    setLaunchingExId(exId);
    setDockerErrorMsg(null);
    try {
      const res = await labApi.startLab(exId, currentUser?.email || 'student@lab.dev');
      if (res && res.sessionId) {
        navigate(`/exercise?id=${exId}&session_id=${res.sessionId}`);
      } else {
        navigate(`/exercise?id=${exId}`);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.error || "Docker container service is starting. Please ensure Docker Desktop is running.";
      setDockerErrorMsg(errMsg);
    } finally {
      setLaunchingExId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Docker Notice if error */}
      {dockerErrorMsg && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--status-danger-bg)',
          border: '1px solid var(--status-danger-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--status-danger)',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>Container Provisioning Notice:</strong> {dockerErrorMsg}
          </div>
          <button 
            onClick={() => setDockerErrorMsg(null)}
            style={{ background: 'none', border: 'none', color: 'var(--status-danger)', fontWeight: '600', cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Student Benchmarking Hub
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>
          Welcome, {currentUser?.first_name || currentUser?.name || 'Student'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Workspace account: <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentUser?.email || 'student@university.edu'}</span>
        </p>
      </div>

      {/* 5-Stage Scientific Evaluation Workflow */}
      <div className="tech-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Evaluation Workflow
            </div>
            <h3 style={{ fontSize: '16px', marginTop: '2px' }}>
              Sequential 5-Stage Knowledge Benchmark
            </h3>
          </div>
          <button 
            className="tech-btn tech-btn-sm tech-btn-primary"
            onClick={() => navigate('/pre-test')}
          >
            Start Step 1: Pre-Test
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {[
            { step: '1. Pre-Test', path: '/pre-test', desc: 'Baseline conceptual check' },
            { step: '2. Guided Labs', path: '/modules', desc: 'Docker target exercises' },
            { step: '3. Post-Test', path: '/post-test', desc: 'Normalized gain measurement' },
            { step: '4. Transfer Lab', path: '/assessment', desc: 'Blind target schema' },
            { step: '5. Usability', path: '/usability', desc: 'System usability survey' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              style={{
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.step}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards & Active Lab Launcher */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        {/* Active Session Launcher */}
        <div 
          onClick={handleContinueActiveLab}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--text-inverse)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '140px',
            boxShadow: 'var(--shadow-standard)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Container Session</span>
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: activeSess ? 'var(--status-success)' : 'rgba(255,255,255,0.25)',
              color: '#ffffff'
            }}>
              {activeSess ? 'IN_PROGRESS' : 'READY TO START'}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
              {launchingExId ? 'Provisioning container...' : (activeSess?.title || 'Launch Guided Lab Workbench')}
            </div>
            <div style={{ fontSize: '12px', color: '#a7f3d0' }}>
              {activeSess ? `Port ${activeSess.port} • Timer active` : 'Select an exercise to initialize Docker environment'}
            </div>
          </div>
        </div>

        {/* KPI: Technique Transfer */}
        <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Technique Transfer Score
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-primary)' }}>
              {stats.total_score > 0 ? `${stats.total_score} pts` : '0 pts'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Based on ground-truth Oracle verifications
            </div>
          </div>
        </div>

        {/* KPI: Completion Rate */}
        <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Curriculum Completion
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {stats.completion_rate}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {stats.completed_count} of {stats.total_exercises} laboratory modules completed
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Progress Table & Competency Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Progress Table */}
        <div className="tech-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px' }}>Module progress & execution status</h2>
            <button 
              className="tech-btn tech-btn-sm tech-btn-secondary"
              onClick={() => navigate('/modules')}
            >
              View catalog
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.map(item => (
              <div 
                key={item.exercise_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{item.lab_id} • {item.owasp}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '2px' }}>{item.title}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: item.status === 'COMPLETED' ? 'var(--status-success-bg)' : 'var(--bg-surface-3)',
                    color: item.status === 'COMPLETED' ? 'var(--status-success)' : 'var(--text-secondary)'
                  }}>
                    {item.status === 'COMPLETED' ? 'Verified' : 'Pending'}
                  </span>
                  <button 
                    className={`tech-btn tech-btn-sm ${item.status === 'COMPLETED' ? 'tech-btn-secondary' : 'tech-btn-primary'}`}
                    onClick={() => navigate(`/exercise?id=${item.exercise_id}`)}
                  >
                    {item.status === 'COMPLETED' ? 'Review' : 'Launch'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Activity Stream & Research Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Research Competency */}
          <div className="tech-card">
            <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Competency coverage</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Covers OWASP API Security Top 10 (BOLA, BOPLA, BFLA, SSRF) and Model Context Protocol (MCP v1.0) agentic tool injection flaws.
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Verified attempts</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{stats.completed_count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Oracle state verifications</span>
                <span style={{ fontWeight: '600', color: 'var(--status-success)' }}>Active</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="tech-card">
            <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Session history</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivity.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No recent sessions recorded.</div>
              ) : (
                recentActivity.map(act => (
                  <div key={act.sessionId} style={{ fontSize: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{act.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '2px', fontSize: '11px' }}>
                      <span>Status: {act.status}</span>
                      <span>{act.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
