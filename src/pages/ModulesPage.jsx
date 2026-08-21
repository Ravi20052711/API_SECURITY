import React, { useState } from 'react';
import { Search, Clock, Play, Box, ExternalLink } from 'lucide-react';
import { EXERCISES, MODULE_CATEGORIES } from '../data/mockData';
import { labApi } from '../services/api';

export default function ModulesPage({ navigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loadingExId, setLoadingExId] = useState(null);

  const handleLaunchExercise = async (exId) => {
    setLoadingExId(exId);
    
    // Extract current authenticated user email
    let userEmail = 'student@lab.dev';
    const profileSaved = localStorage.getItem('user_profile');
    if (profileSaved) {
      try {
        const u = JSON.parse(profileSaved);
        if (u.email) userEmail = u.email;
      } catch {}
    }

    try {
      // Step 1: Call Backend POST /api/v1/labs/:exerciseId/start with userEmail
      const res = await labApi.startLab(exId, userEmail);
      
      // Step 2: Open rich interactive Lab Frontend UI with per-user container session
      if (res && res.sessionId) {
        navigate(`/exercise?id=${exId}&session_id=${res.sessionId}`);
      } else {
        navigate(`/exercise?id=${exId}`);
      }
    } catch {
      navigate(`/exercise?id=${exId}`);
    } finally {
      setLoadingExId(null);
    }
  };

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.owasp.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'all' || ex.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      {/* Title */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // OWASP API SECURITY TOP 10 CATALOG • INTERACTIVE CYBERLABS
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Vulnerability Training Catalog
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Click an exercise to launch your dedicated, isolated per-user Docker container lab session.
        </p>
      </div>

      {/* Category Pills & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Search Bar */}
        <div className="tech-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '440px' }}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Search OWASP vulnerability modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
          />
        </div>

        {/* Category Selector */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`tech-btn tech-btn-sm ${selectedCat === 'all' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            onClick={() => setSelectedCat('all')}
          >
            All Modules
          </button>
          {MODULE_CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              className={`tech-btn tech-btn-sm ${selectedCat === cat.id ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.name.split(' ')[0]} ({cat.owasp})
            </button>
          ))}
        </div>

      </div>

      {/* Module Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {filteredExercises.map((ex) => (
          <div key={ex.id} className="tech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="tech-badge badge-cyan">{ex.owasp}</span>
                <span className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
                  <Clock size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {ex.estimatedTime}
                </span>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{ex.title}</h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
                {ex.scenario}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700' }}>DIFFICULTY: {ex.difficulty}</span>

              <button 
                className="tech-btn tech-btn-sm tech-btn-primary"
                disabled={loadingExId === ex.id}
                onClick={() => handleLaunchExercise(ex.id)}
              >
                <ExternalLink size={12} />
                <span>{loadingExId === ex.id ? 'Provisioning Container...' : 'Enter Lab Environment'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
