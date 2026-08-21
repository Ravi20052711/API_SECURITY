import React, { useState, useEffect } from 'react';
import { Play, Plus, Target, Clock, ShieldCheck, ArrowRight, ExternalLink, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { exerciseApi, labApi } from '../services/api';

export default function DashboardPage({ navigate }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return { name: 'Student Hacker', email: 'student@lab.dev' };
  });

  const [dashboardData, setDashboardData] = useState({
    user: currentUser,
    active_lab_session: null,
    stats: {
      completed_count: 0,
      total_exercises: 5,
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

  const stats = dashboardData.stats || { completed_count: 0, total_exercises: 5, completion_rate: 0, total_score: 0 };
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
      const errMsg = err?.response?.data?.error || "Docker Desktop is not currently running. Please start Docker Desktop and try provisioning the laboratory again.";
      setDockerErrorMsg(errMsg);
    } finally {
      setLaunchingExId(null);
    }
  };

  const isBolaDone = items.some(i => i.exercise_id === 'ex-bola-01' && i.status === 'COMPLETED');
  const isBflaDone = items.some(i => i.exercise_id === 'ex-bfla-01' && i.status === 'COMPLETED');
  const isMassDone = items.some(i => i.exercise_id === 'ex-mass-01' && i.status === 'COMPLETED');
  const isSsrfDone = items.some(i => i.exercise_id === 'ex-ssrf-01' && i.status === 'COMPLETED');

  const rBola = isBolaDone ? 75 : 25;
  const rAuthN = isBflaDone ? 75 : 25;
  const rMass = isMassDone ? 75 : 25;
  const rRate = 30;
  const rBfla = isBflaDone ? 75 : 25;
  const rSsrf = isSsrfDone ? 75 : 25;

  const polyPoints = `
    ${100},${100 - rBola} 
    ${100 + rAuthN * 0.866},${100 - rAuthN * 0.5} 
    ${100 + rMass * 0.866},${100 + rMass * 0.5} 
    ${100},${100 + rRate} 
    ${100 - rBfla * 0.866},${100 + rBfla * 0.5} 
    ${100 - rSsrf * 0.866},${100 - rSsrf * 0.5}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '32px' }}>
      
      {/* Docker Error Alert Banner */}
      {dockerErrorMsg && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#991b1b',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          justifySpace: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#dc2626" />
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px' }}>Lab Provisioning Notice</div>
              <div>{dockerErrorMsg}</div>
            </div>
          </div>
          <button 
            onClick={() => setDockerErrorMsg(null)}
            style={{ background: 'none', border: 'none', color: '#991b1b', fontWeight: '800', cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>
          // PERSONALIZED STUDENT DASHBOARD • STRICT MULTI-USER ISOLATION
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Welcome back, <span style={{ color: 'var(--brand-orange)' }}>{currentUser?.name || currentUser?.email || 'Student Hacker'}</span>
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
          Isolated Account Workspace for <span className="mono" style={{ color: '#0f172a', fontWeight: '700' }}>{currentUser?.email || 'student@lab.dev'}</span>
        </p>
      </div>

      {/* 3 Action Cards with Current Active Lab Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* Card 1: Active Lab Session / Continue Lab */}
        <div 
          onClick={handleContinueActiveLab}
          style={{
            background: activeSess ? 'var(--brand-navy)' : '#0f172a',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '140px',
            boxShadow: '0 4px 12px rgba(27, 20, 100, 0.15)',
            border: activeSess ? '1px solid #3b0764' : '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>▷ Current Active Lab</span>
            <span className="mono" style={{ fontSize: '11px', background: activeSess ? '#22c55e' : '#64748b', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
              {activeSess ? 'IN_PROGRESS' : 'NO ACTIVE LAB'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>
              {launchingExId ? 'Checking Docker & Provisioning Container...' : (activeSess?.title || 'Click to launch lab catalog')}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85 }} className="mono">
              {activeSess ? `Port ${activeSess.port} • Timer Active` : 'Select a lab to start isolated container'}
            </div>
          </div>
        </div>

        {/* Card 2: Vulnerability Training Catalog */}
        <div 
          className="tech-card"
          onClick={() => navigate('/modules')}
          style={{
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '140px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>⚡ Training Catalog</span>
            <ArrowRight size={18} color="#64748b" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              OWASP Top 10 Guided Labs
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {stats.completed_count} of {stats.total_exercises} exercises completed
            </div>
          </div>
        </div>

        {/* Card 3: Unfamiliar API Transfer Assessment */}
        <div 
          className="tech-card"
          onClick={() => navigate('/assessment')}
          style={{
            padding: '24px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '140px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>🎯 Transfer Lab</span>
            <Target size={18} color="var(--brand-orange)" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              Unfamiliar API Assessment
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Test skill transfer on blind target schemas
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: User Specific Progress & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Progress Items & Earned Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Progress Overview Table */}
          <div className="tech-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Exercise Completion Progress</h2>
              <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--brand-navy)' }}>
                Overall: {stats.completion_rate}% ({stats.completed_count}/{stats.total_exercises})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map(item => (
                <div 
                  key={item.exercise_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: item.status === 'COMPLETED' ? '#f0fdf4' : item.status === 'IN_PROGRESS' ? '#fffbeb' : '#f8fafc',
                    border: item.status === 'COMPLETED' ? '1px solid #bbf7d0' : item.status === 'IN_PROGRESS' ? '1px solid #fef08a' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: item.status === 'COMPLETED' ? '#16a34a' : item.status === 'IN_PROGRESS' ? '#d97706' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}>
                      {item.status === 'COMPLETED' ? '✓' : item.status === 'IN_PROGRESS' ? '▶' : '•'}
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: '10px', color: '#64748b' }}>{item.lab_id} • {item.owasp}</div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{item.title}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                      {item.score} pts
                    </span>
                    <button 
                      className={`tech-btn tech-btn-sm ${item.status === 'COMPLETED' ? 'tech-btn-secondary' : 'tech-btn-primary'}`}
                      onClick={() => navigate(`/exercise?id=${item.exercise_id}`)}
                    >
                      {item.status === 'COMPLETED' ? 'Review' : item.status === 'IN_PROGRESS' ? 'Resume' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Earned Badges */}
          <div className="tech-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Earned Security Badges</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {(dashboardData.badges || []).map(b => (
                <div 
                  key={b.id} 
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    background: b.unlocked ? '#eff6ff' : '#f8fafc',
                    border: b.unlocked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    opacity: b.unlocked ? 1 : 0.5
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{b.unlocked ? '🏆' : '🔒'}</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: b.unlocked ? '#1e40af' : '#64748b' }}>{b.name}</div>
                  <div className="mono" style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{b.unlocked ? 'UNLOCKED' : 'LOCKED'}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: User Skill Radar & Activity Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Skill Radar Card */}
          <div className="tech-card" style={{ padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Vulnerability Competency Radar</h3>
            <svg width="200" height="200" style={{ margin: '0 auto' }}>
              <polygon points="100,25 165,62 165,138 100,175 35,138 35,62" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              <polygon points="100,50 143,75 143,125 100,150 57,125 57,75" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              <polygon points="100,75 121,87 121,113 100,125 79,113 79,87" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              <polygon points={polyPoints} fill="rgba(27, 20, 100, 0.2)" stroke="#1b1464" strokeWidth="2" />
            </svg>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
              Calculated dynamically from target completions
            </div>
          </div>

          {/* User Recent Activity Stream */}
          <div className="tech-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Personal Activity Stream</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>No recent lab sessions.</div>
              ) : (
                recentActivity.map(act => (
                  <div key={act.sessionId} style={{ fontSize: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{act.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '2px' }} className="mono">
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
