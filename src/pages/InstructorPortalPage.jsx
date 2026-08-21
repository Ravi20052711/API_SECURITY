import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, RotateCcw, AlertTriangle, BarChart3, Search, RefreshCw, Eye, ShieldCheck, Award } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function InstructorPortalPage() {
  const [learners, setLearners] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [learnerDetail, setLearnerDetail] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchInstructorData = async () => {
    setLoading(true);
    try {
      const [learnersRes, analyticsRes] = await Promise.all([
        apiFetch('/instructor/learners'),
        apiFetch('/instructor/analytics')
      ]);

      if (learnersRes && learnersRes.learners) setLearners(learnersRes.learners);
      if (analyticsRes && analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
    } catch {
      setActionNotice({ type: 'error', message: 'Failed to load Instructor data. Ensure you possess Instructor permissions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const handleViewDetail = async (learner) => {
    setSelectedLearner(learner);
    try {
      const res = await apiFetch(`/instructor/learners/${learner.id}/detail`);
      if (res && res.exercise_details) setLearnerDetail(res);
    } catch {
      setActionNotice({ type: 'error', message: 'Error fetching learner details.' });
    }
  };

  const handleResetProgress = async (learnerId, username) => {
    if (!window.confirm(`Are you sure you want to reset all exercise progress for learner "${username}" to 0%?`)) return;

    try {
      const res = await apiFetch(`/instructor/learners/${learnerId}/reset-progress`, { method: 'POST' });
      if (res && res.message) {
        setActionNotice({ type: 'success', message: res.message });
        fetchInstructorData();
        if (selectedLearner && selectedLearner.id === learnerId) setSelectedLearner(null);
      }
    } catch {
      setActionNotice({ type: 'error', message: 'Failed to reset learner progress.' });
    }
  };

  const filteredLearners = learners.filter(l => 
    l.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '800', letterSpacing: '1px' }}>
              STAFF MANAGEMENT PORTAL
            </span>
            <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
              Role: Instructor
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-navy)', margin: 0 }}>
            Instructor Dashboard & Progress Management
          </h1>
        </div>

        <button 
          onClick={fetchInstructorData}
          className="button"
          style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {actionNotice && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '13.5px',
          fontWeight: '600',
          background: actionNotice.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${actionNotice.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: actionNotice.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {actionNotice.message}
        </div>
      )}

      {/* Overview Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span className="mono" style={{ fontSize: '11px', fontWeight: '800' }}>ASSIGNED LEARNERS</span>
              <Users size={18} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-navy)', marginTop: '8px' }}>
              {analytics.total_learners}
            </div>
            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>
              {analytics.active_learners} Active Learners
            </div>
          </div>

          <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span className="mono" style={{ fontSize: '11px', fontWeight: '800' }}>COMPLETED EXERCISES</span>
              <CheckCircle2 size={18} color="#16a34a" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-navy)', marginTop: '8px' }}>
              {analytics.completed_exercises_total}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Across OWASP Top 10 Catalog
            </div>
          </div>

          <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span className="mono" style={{ fontSize: '11px', fontWeight: '800' }}>OVERALL COMPLETION</span>
              <BarChart3 size={18} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-navy)', marginTop: '8px' }}>
              {analytics.overall_completion_rate}%
            </div>
            <div style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: '600', marginTop: '4px' }}>
              Classroom Progress Average
            </div>
          </div>

          <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span className="mono" style={{ fontSize: '11px', fontWeight: '800' }}>ACTIVE LAB SESSIONS</span>
              <ShieldCheck size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-navy)', marginTop: '8px' }}>
              {analytics.active_labs_count}
            </div>
            <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '600', marginTop: '4px' }}>
              Docker Containers Running
            </div>
          </div>

        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search learners by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
          Showing {filteredLearners.length} assigned learners
        </div>
      </div>

      {/* Learners Directory Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 20px' }}>Learner Identity</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
              <th style={{ padding: '14px 20px' }}>Progress</th>
              <th style={{ padding: '14px 20px' }}>Score</th>
              <th style={{ padding: '14px 20px' }}>Active Lab</th>
              <th style={{ padding: '14px 20px' }}>Assessment Readiness</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading assigned learner data...
                </td>
              </tr>
            ) : filteredLearners.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No learners found matching search.
                </td>
              </tr>
            ) : (
              filteredLearners.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{l.name}</div>
                    <div className="mono" style={{ fontSize: '11px', color: '#64748b' }}>{l.email}</div>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: l.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                      color: l.status === 'Active' ? '#166534' : '#991b1b',
                      border: `1px solid ${l.status === 'Active' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {l.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${l.completion_rate}%`, height: '100%', background: 'var(--brand-orange)', borderRadius: '4px' }} />
                      </div>
                      <span className="mono" style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>
                        {l.completed_count}/{l.total_exercises} ({l.completion_rate}%)
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 20px', fontWeight: '800', color: 'var(--brand-navy)' }}>
                    {l.total_score} pts
                  </td>

                  <td style={{ padding: '14px 20px', fontSize: '12px', color: '#475569' }}>
                    <span className="mono" style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {l.current_exercise}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: l.assessment_status === 'Ready' ? '#ecfdf5' : '#fffbe6',
                      color: l.assessment_status === 'Ready' ? '#047857' : '#b45309',
                      border: `1px solid ${l.assessment_status === 'Ready' ? '#a7f3d0' : '#fde68a'}`
                    }}>
                      {l.assessment_status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleViewDetail(l)}
                        style={{ padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={14} /> View
                      </button>

                      <button
                        onClick={() => handleResetProgress(l.id, l.username)}
                        style={{ padding: '6px 12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RotateCcw size={14} /> Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Learner Overview Modal */}
      {selectedLearner && learnerDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ background: 'linear-gradient(135deg, #1b1464 0%, #0f172a 100%)', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ff9800' }}>
              <div>
                <span className="mono" style={{ fontSize: '11px', color: '#ff9800', fontWeight: '800' }}>// LEARNER INSPECTION DETAILS</span>
                <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                  {selectedLearner.name} ({selectedLearner.email})
                </h2>
              </div>
              <button onClick={() => setSelectedLearner(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>Exercise Completion & Attempt Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {learnerDetail.exercise_details.map((ex, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{ex.title}</div>
                      <div className="mono" style={{ fontSize: '11px', color: '#64748b' }}>OWASP: {ex.owasp} • ID: {ex.exercise_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800',
                        background: ex.status === 'COMPLETED' ? '#f0fdf4' : '#fffbe6',
                        color: ex.status === 'COMPLETED' ? '#166534' : '#b45309',
                        border: `1px solid ${ex.status === 'COMPLETED' ? '#bbf7d0' : '#fde68a'}`
                      }}>
                        {ex.status} ({ex.score} pts)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
