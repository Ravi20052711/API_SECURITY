import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Eye, Clock, Terminal, Activity, FileText, UserX } from 'lucide-react';
import { adminApi } from '../services/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);

  // Selected User Inspector Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Modals for Administrative Actions
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAdminData = () => {
    adminApi.getOverviewStats().then(setOverviewStats).catch(() => {});
    adminApi.getAllStudentProgress().then(res => setUsers(res || [])).catch(() => {});
    adminApi.getAuditLog().then(res => setAuditLogs(res || [])).catch(() => {});
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleOpenUserDetail = async (userId) => {
    setSelectedUserId(userId);
    setLoading(true);
    try {
      const detail = await adminApi.getUserDetail(userId);
      setSelectedUserDetail(detail);
    } catch {
      triggerToast('Error loading user details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!targetUser) return;
    setLoading(true);
    try {
      const res = await adminApi.resetUserProgress(targetUser.user_id || targetUser.id);
      triggerToast(res.message || `Progress for ${targetUser.email} reset to 0%.`);
      setShowResetModal(false);
      loadAdminData();
      if (selectedUserId) handleOpenUserDetail(selectedUserId);
    } catch {
      triggerToast(`Failed to reset progress for ${targetUser.email}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmComplete = async () => {
    if (!targetUser) return;
    setLoading(true);
    try {
      const res = await adminApi.completeUserProgress(targetUser.user_id || targetUser.id, 'all');
      triggerToast(res.message || `Progress for ${targetUser.email} marked as 100% completed.`);
      setShowCompleteModal(false);
      loadAdminData();
      if (selectedUserId) handleOpenUserDetail(selectedUserId);
    } catch {
      triggerToast(`Failed to complete progress for ${targetUser.email}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!targetUser) return;
    setLoading(true);
    try {
      const res = await adminApi.deleteUser(targetUser.user_id || targetUser.id);
      triggerToast(res.message || `User account ${targetUser.email} removed and active containers terminated.`);
      setShowDeleteModal(false);
      if (selectedUserId === (targetUser.user_id || targetUser.id)) {
        setSelectedUserDetail(null);
        setSelectedUserId(null);
      }
      loadAdminData();
    } catch (err) {
      triggerToast(err?.response?.data?.error || `Administrative policy forbids deleting primary admin accounts.`);
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '72px',
          right: '24px',
          background: '#d1fae5',
          border: '1px solid #34d399',
          color: '#065f46',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: '700',
          zIndex: 300,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          ✔ {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // ADMINISTRATIVE CONTROL CENTER • FULL ADMIN POWERS ENABLED
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Admin Dashboard & User Management
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Platform-wide user administration, progress control, user account removal, and audit logging.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>REGISTERED USERS</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{users.length}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Multi-user student accounts</div>
        </div>

        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>ACTIVE LAB CONTAINERS</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>{overviewStats?.active_containers || 0}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Isolated Docker instances</div>
        </div>

        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>VALIDATION QUEUE</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#ea580c', marginTop: '4px' }}>{overviewStats?.pending_validations || 0}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Pending instructor reviews</div>
        </div>

        <div className="tech-card" style={{ padding: '20px' }}>
          <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>SYSTEM GUARDRAILS</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0284c7', marginTop: '4px' }}>{overviewStats?.guardrail_health || '100%'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Negative containment suite</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button className={`tech-btn tech-btn-sm ${activeTab === 'users' ? 'tech-btn-primary' : 'tech-btn-secondary'}`} onClick={() => setActiveTab('users')}>
          <Users size={14} /> User Management ({users.length})
        </button>
        <button className={`tech-btn tech-btn-sm ${activeTab === 'audit' ? 'tech-btn-primary' : 'tech-btn-secondary'}`} onClick={() => setActiveTab('audit')}>
          <FileText size={14} /> Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedUserDetail ? '1fr 1fr' : '1fr', gap: '24px' }}>
          
          {/* Main User Directory List Table */}
          <div className="tech-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Platform Registered Users</h3>
              <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={loadAdminData}>
                <RefreshCw size={13} /> Refresh User Directory
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }} className="mono">
                    <th style={{ padding: '10px' }}>USERNAME</th>
                    <th style={{ padding: '10px' }}>EMAIL</th>
                    <th style={{ padding: '10px' }}>PROGRESS</th>
                    <th style={{ padding: '10px' }}>STATUS</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>ADMIN CONTROL ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id || u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '700' }}>
                        <button 
                          onClick={() => handleOpenUserDetail(u.user_id || u.id)}
                          style={{ background: 'none', border: 'none', color: '#1b1464', cursor: 'pointer', fontWeight: '700', padding: 0 }}
                        >
                          {u.username || u.name}
                        </button>
                      </td>
                      <td className="mono" style={{ padding: '12px 10px', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${u.completion_rate}%`, height: '100%', background: '#1b1464' }} />
                          </div>
                          <span className="mono" style={{ fontSize: '11px', fontWeight: '700' }}>{u.completion_rate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`tech-badge ${u.status === 'In Lab' ? 'badge-amber' : u.status === 'Online' ? 'badge-green' : 'badge-muted'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="tech-btn tech-btn-sm tech-btn-secondary" 
                            onClick={() => handleOpenUserDetail(u.user_id || u.id)}
                            title="Inspect User Details"
                          >
                            <Eye size={13} /> Inspect
                          </button>

                          <button 
                            className="tech-btn tech-btn-sm tech-btn-secondary"
                            onClick={() => { setTargetUser(u); setShowResetModal(true); }}
                            title="Reset Progress to 0%"
                          >
                            <RefreshCw size={13} /> Reset 0%
                          </button>

                          <button 
                            className="tech-btn tech-btn-sm"
                            style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                            onClick={() => { setTargetUser(u); setShowCompleteModal(true); }}
                            title="Mark 100% Complete"
                          >
                            <CheckCircle2 size={13} /> Complete 100%
                          </button>

                          {/* PROMINENT REMOVE USER BUTTON */}
                          <button 
                            className="tech-btn tech-btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', fontWeight: '700' }}
                            onClick={() => { setTargetUser(u); setShowDeleteModal(true); }}
                            title="Remove User Account & Terminate Session"
                          >
                            <UserX size={13} /> Remove User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Progress Inspector Side Panel */}
          {selectedUserDetail && (
            <div className="tech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="mono" style={{ fontSize: '11px', color: '#ff9800', fontWeight: '700' }}>USER PROGRESS INSPECTOR</div>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{selectedUserDetail.user.name}</h2>
                  <div className="mono" style={{ fontSize: '12px', color: '#64748b' }}>{selectedUserDetail.user.email}</div>
                </div>
                <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setSelectedUserDetail(null)}>Close</button>
              </div>

              {/* Overall Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>OVERALL PROGRESS</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{selectedUserDetail.progress.completion_rate}%</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>TOTAL POINTS</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a' }}>{selectedUserDetail.progress.total_score}</div>
                </div>
              </div>

              {/* Active Lab Session if running */}
              {selectedUserDetail.active_session && (
                <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '16px', borderRadius: '8px' }}>
                  <div className="mono" style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>ACTIVE CONTAINER SESSION</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#78350f', marginTop: '4px' }}>
                    Lab: {selectedUserDetail.active_session.exercise_id} • Port: {selectedUserDetail.active_session.port}
                  </div>
                </div>
              )}

              {/* Assigned Labs */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Assigned Lab Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedUserDetail.labs.map(lab => (
                    <div key={lab.exercise_id} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div className="mono" style={{ fontSize: '10px', color: '#94a3b8' }}>{lab.lab_id}</div>
                        <div style={{ fontSize: '12px', fontWeight: '700' }}>{lab.title}</div>
                      </div>
                      <span className={`tech-badge ${lab.status === 'COMPLETED' ? 'badge-green' : lab.status === 'IN_PROGRESS' ? 'badge-amber' : 'badge-muted'}`}>
                        {lab.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button 
                  className="tech-btn tech-btn-sm tech-btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => { setTargetUser(selectedUserDetail.user); setShowResetModal(true); }}
                >
                  Reset 0%
                </button>
                <button 
                  className="tech-btn tech-btn-sm" 
                  style={{ flex: 1, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                  onClick={() => { setTargetUser(selectedUserDetail.user); setShowCompleteModal(true); }}
                >
                  Complete 100%
                </button>

                {/* PROMINENT REMOVE USER BUTTON IN INSPECTOR */}
                <button 
                  className="tech-btn tech-btn-sm" 
                  style={{ flex: 1, background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', fontWeight: '700' }}
                  onClick={() => { setTargetUser(selectedUserDetail.user); setShowDeleteModal(true); }}
                >
                  Remove User
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="tech-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Administrative Action Audit Log</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }} className="mono">
                  <th style={{ padding: '10px' }}>TIMESTAMP</th>
                  <th style={{ padding: '10px' }}>ADMIN USER</th>
                  <th style={{ padding: '10px' }}>ACTION</th>
                  <th style={{ padding: '10px' }}>TARGET USER</th>
                  <th style={{ padding: '10px' }}>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="mono" style={{ padding: '12px 10px', color: '#64748b' }}>{log.timestamp}</td>
                    <td style={{ padding: '12px 10px', fontWeight: '600' }}>{log.admin}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="tech-badge badge-amber">{log.action}</span>
                    </td>
                    <td className="mono" style={{ padding: '12px 10px' }}>{log.target_user}</td>
                    <td style={{ padding: '12px 10px', color: '#475569' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Reset User Progress?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
              This will reset <strong>{targetUser?.email || targetUser?.name}</strong>'s lab/module progress to <strong>0%</strong> and remove their completion status. This action may affect their current lab session.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button className="tech-btn tech-btn-sm tech-btn-amber" onClick={handleConfirmReset} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Progress'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '440px', width: '100%', padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Mark Progress as Completed?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
              This will mark all lab challenges for <strong>{targetUser?.email || targetUser?.name}</strong> as <strong>100% Completed</strong> in the database.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
              <button className="tech-btn tech-btn-sm tech-btn-primary" onClick={handleConfirmComplete} disabled={loading}>
                {loading ? 'Completing...' : 'Mark Completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '460px', width: '100%', padding: '24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>Remove User Account?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
              This will permanently remove <strong>{targetUser?.email || targetUser?.name}</strong>'s account and associated data. If the user currently has an active lab, that session and Docker container will be immediately terminated.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="tech-btn tech-btn-sm" style={{ background: '#dc2626', color: '#ffffff', fontWeight: '700' }} onClick={handleConfirmDelete} disabled={loading}>
                {loading ? 'Removing User...' : 'Remove User Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
