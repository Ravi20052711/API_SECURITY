import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CheckSquare, Activity, ShieldCheck, Search, Lock, RefreshCw, Plus, TrendingUp, Award } from 'lucide-react';
import { adminAuth, adminApi } from '../services/api';

export default function AdminPortalPage({ navigate }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [stats, setStats] = useState({
    total_users: 18,
    active_containers: 6,
    pending_validations: 2,
    guardrail_health: '100%'
  });

  const [users, setUsers] = useState([
    { id: 'usr-1', email: 'alice@lab.dev', name: 'Alice Chen', role: 'student', status: 'ACTIVE' },
    { id: 'usr-2', email: 'bob@lab.dev', name: 'Bob Smith', role: 'student', status: 'ACTIVE' },
    { id: 'usr-3', email: 'instructor@lab.dev', name: 'Dr. Evelyn Vance', role: 'instructor', status: 'ACTIVE' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            System Administration Portal
          </div>
          <h1 style={{ fontSize: '28px', marginBottom: '6px' }}>
            Platform Control & Container Telemetry
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Manage student cohorts, Docker container instances, guardrail health, and verification queues.
          </p>
        </div>

        <button className="tech-btn tech-btn-secondary" onClick={() => window.location.reload()}>
          <RefreshCw size={14} /> Refresh Telemetry
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'containers', label: 'Container Health', icon: ShieldCheck }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tech-btn tech-btn-sm ${isActive ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            >
              <IconComp size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Registered Users</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '6px' }}>{stats.total_users}</div>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Docker Containers</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '6px' }}>{stats.active_containers}</div>
        </div>

        <div className="tech-card">
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Guardrail Health</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--status-success)', marginTop: '6px' }}>{stats.guardrail_health}</div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'users' && (
        <div className="tech-card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>User Accounts & Roles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{u.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email} • Role: {u.role}</div>
                </div>
                <span className="badge-emerald">{u.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="tech-card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Operational Health Overview</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            All isolated container sandboxes are operating within safe memory and network parameters. No safety boundary breaches detected.
          </p>
        </div>
      )}

      {activeTab === 'containers' && (
        <div className="tech-card">
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Active Container Sandboxes</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            6 container instances currently bound to dynamic local host ports (8101 - 8106).
          </p>
        </div>
      )}

    </div>
  );
}
