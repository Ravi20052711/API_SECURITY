import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';

export default function SettingsPage({ currentUser, navigate }) {
  const [name, setName] = useState(currentUser?.name || 'Alice Chen');
  const [email, setEmail] = useState(currentUser?.email || 'student@lab.dev');
  const [apiKey, setApiKey] = useState('hacktheapi_live_sk_9041a8b77621c');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert("Profile settings updated successfully.");
  };

  const handleGenerateApiKey = () => {
    setApiKey(`hacktheapi_live_sk_${Math.random().toString(36).substring(2, 15)}`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      {/* Title */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // ACCOUNT & PROFILE SETTINGS
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Account & Profile Settings
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Manage your platform credentials, API keys, and privacy preferences.
        </p>
      </div>

      {/* Profile Info Form */}
      <div className="tech-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Profile Information</h3>
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '13px', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '13px', outline: 'none' }} />
          </div>

          <button type="submit" className="tech-btn tech-btn-primary" style={{ alignSelf: 'flex-start' }}>Save Profile Changes</button>
        </form>
      </div>

      {/* API Key Management */}
      <div className="tech-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Programmatic API Key Management</h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>Use this secret key to authenticate CLI tools and automated submission scripts.</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input type="text" readOnly value={apiKey} className="mono" style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0d9488', fontSize: '12px' }} />
          <button className="tech-btn tech-btn-secondary" onClick={handleGenerateApiKey}>Roll Key</button>
        </div>
      </div>

      {/* GDPR Data Export & Account Deletion */}
      <div className="tech-card" style={{ padding: '24px', borderLeft: '4px solid #ef4444' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444', marginBottom: '12px' }}>Privacy & Data Rights</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="tech-btn tech-btn-secondary" onClick={() => alert("Downloading GDPR data export JSON...")}>
            <Download size={14} /> Download Personal Data Export (GDPR)
          </button>
          <button className="tech-btn tech-btn-danger" onClick={() => alert("Account deletion requires instructor confirmation.")}>
            <Trash2 size={14} /> Delete Account & Purge Metadata
          </button>
        </div>
      </div>

    </div>
  );
}
