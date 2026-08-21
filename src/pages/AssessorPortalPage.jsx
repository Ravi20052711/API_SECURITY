import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Search, RefreshCw, Eye, Star, FileText } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function AssessorPortalPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState(null);
  const [scoreForm, setScoreForm] = useState({ status: 'PASSED', score: 90, feedback: '' });
  const [actionNotice, setActionNotice] = useState(null);

  const fetchAssessorData = async () => {
    setLoading(true);
    try {
      const [queueRes, kpiRes] = await Promise.all([
        apiFetch('/assessor/queue'),
        apiFetch('/assessor/kpis')
      ]);

      if (queueRes && queueRes.evaluations) setEvaluations(queueRes.evaluations);
      if (kpiRes && kpiRes.kpis) setKpis(kpiRes.kpis);
    } catch {
      setActionNotice({ type: 'error', message: 'Failed to load Assessor queue. Ensure you possess Assessor permissions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessorData();
  }, []);

  const handleOpenScoreModal = (item) => {
    setSelectedEval(item);
    setScoreForm({
      status: item.status === 'SUBMITTED' ? 'PASSED' : item.status,
      score: item.score || 90,
      feedback: 'Transfer technique evaluation successfully verified by Assessor. Requirements met.'
    });
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEval) return;

    try {
      const res = await apiFetch(`/assessor/evaluations/${selectedEval.id}/score`, {
        method: 'POST',
        body: JSON.stringify(scoreForm)
      });

      if (res && res.message) {
        setActionNotice({ type: 'success', message: res.message });
        setSelectedEval(null);
        fetchAssessorData();
      }
    } catch {
      setActionNotice({ type: 'error', message: 'Failed to evaluate assessment submission.' });
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '800', letterSpacing: '1px' }}>
              ASSESSOR PORTAL & TRANSFER TESTING
            </span>
            <span style={{ background: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
              Role: Assessor
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-navy)', margin: 0 }}>
            Transfer Evaluation & KPI Assessment Center
          </h1>
        </div>

        <button 
          onClick={fetchAssessorData}
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

      {/* KPI Rubric Performance Summary */}
      {kpis && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award size={20} color="var(--brand-orange)" />
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--brand-navy)' }}>
              Capstone Project KPI Performance Rubrics (KPI-1 to KPI-6)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {Object.entries(kpis).map(([key, item]) => (
              <div key={key} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="mono" style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>{item.name}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '800',
                    background: item.status === 'PASS' ? '#f0fdf4' : '#fef2f2',
                    color: item.status === 'PASS' ? '#166534' : '#991b1b',
                    border: `1px solid ${item.status === 'PASS' ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--brand-navy)' }}>
                  {item.score} {typeof item.score === 'number' && key !== 'kpi_4_unsafe_outcomes' ? '%' : ''}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Target Threshold: {item.target}
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* Transfer Assessment Submissions Queue Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
            Transfer Evaluation Submission Queue ({evaluations.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            Evaluating learner technique transfer against blind API targets
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 20px' }}>Evaluation ID</th>
              <th style={{ padding: '14px 20px' }}>Student Email</th>
              <th style={{ padding: '14px 20px' }}>Unfamiliar API Target</th>
              <th style={{ padding: '14px 20px' }}>Status</th>
              <th style={{ padding: '14px 20px' }}>KPI-1 Score</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading assessment queue...
                </td>
              </tr>
            ) : evaluations.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  No assessment submissions in queue.
                </td>
              </tr>
            ) : (
              evaluations.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="mono" style={{ fontWeight: '800', color: '#1e293b' }}>{item.evaluation_id}</span>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.created_at}</div>
                  </td>

                  <td style={{ padding: '14px 20px', fontWeight: '600', color: '#334155' }}>
                    {item.student_email}
                  </td>

                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: '#475569' }}>
                    {item.target_api_name}
                  </td>

                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: item.status === 'PASSED' ? '#f0fdf4' : (item.status === 'FAILED' ? '#fef2f2' : '#eff6ff'),
                      color: item.status === 'PASSED' ? '#166534' : (item.status === 'FAILED' ? '#991b1b' : '#1e40af'),
                      border: `1px solid ${item.status === 'PASSED' ? '#bbf7d0' : (item.status === 'FAILED' ? '#fecaca' : '#bfdbfe')}`
                    }}>
                      {item.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 20px', fontWeight: '800', color: 'var(--brand-navy)' }}>
                    {item.kpi_1_transfer}%
                  </td>

                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenScoreModal(item)}
                      style={{ padding: '6px 14px', background: 'var(--brand-orange)', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Award size={14} /> Evaluate & Score
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Evaluate Modal */}
      {selectedEval && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleScoreSubmit} style={{ maxWidth: '600px', width: '100%', background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            
            <div style={{ background: 'linear-gradient(135deg, #1b1464 0%, #0f172a 100%)', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ff9800' }}>
              <div>
                <span className="mono" style={{ fontSize: '11px', color: '#ff9800', fontWeight: '800' }}>// EVALUATION DECISION</span>
                <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                  {selectedEval.evaluation_id} — {selectedEval.student_email}
                </h2>
              </div>
              <button type="button" onClick={() => setSelectedEval(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                  Assessment Decision Status
                </label>
                <select
                  value={scoreForm.status}
                  onChange={(e) => setScoreForm({ ...scoreForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="PASSED">PASSED (Requirements Satisfied)</option>
                  <option value="FAILED">FAILED (Technique Transfer Deficient)</option>
                  <option value="REASSESSMENT_REQUIRED">REASSESSMENT REQUIRED</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                  Technique Transfer Score (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreForm.score}
                  onChange={(e) => setScoreForm({ ...scoreForm, score: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                  Assessor Feedback & Evidence Notes
                </label>
                <textarea
                  rows="4"
                  value={scoreForm.feedback}
                  onChange={(e) => setScoreForm({ ...scoreForm, feedback: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setSelectedEval(null)} className="button" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>Cancel</button>
              <button type="submit" className="button" style={{ background: 'var(--brand-orange)', color: '#ffffff' }}>Submit Assessment</button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
