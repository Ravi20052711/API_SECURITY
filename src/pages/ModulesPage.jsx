import React, { useState, useEffect } from 'react';
import { EXERCISES, MODULE_CATEGORIES } from '../data/mockData';
import { labApi, exerciseApi } from '../services/api';

export default function ModulesPage({ navigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loadingExId, setLoadingExId] = useState(null);
  const [exercisesList, setExercisesList] = useState(EXERCISES);

  useEffect(() => {
    exerciseApi.getCatalog()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item, idx) => {
            const exId = item.id || item.exercise_id || `ex-${idx}`;
            return {
              id: exId,
              title: item.title || 'Security Exercise',
              category: item.category || 'all',
              owasp: item.owasp || 'OWASP API TOP 10',
              difficulty: item.difficulty || 'Intermediate',
              estimatedTime: item.estimatedTime || '20 min',
              scenario: item.description || item.scenario || item.problem_statement || 'Hands-on vulnerability exercise.',
              objective: item.objective || 'Complete the exploitation challenge.'
            };
          });
          setExercisesList(mapped);
        }
      })
      .catch(() => {
        setExercisesList(EXERCISES);
      });
  }, []);

  const handleLaunchExercise = async (exId) => {
    setLoadingExId(exId);
    
    let userEmail = 'student@lab.dev';
    const profileSaved = localStorage.getItem('user_profile') || localStorage.getItem('user');
    if (profileSaved) {
      try {
        const u = JSON.parse(profileSaved);
        if (u && u.email) userEmail = u.email;
      } catch {}
    }

    try {
      const res = await labApi.startLab(exId, userEmail);
      if (res && res.sessionId) {
        navigate(`/exercise?id=${exId}&session_id=${res.sessionId}`);
      } else {
        navigate(`/exercise?id=${exId}`);
      }
    } catch (err) {
      navigate(`/exercise?id=${exId}`);
    } finally {
      setLoadingExId(null);
    }
  };

  const filtered = exercisesList.filter(ex => {
    const matchesCat = selectedCat === 'all' || ex.category === selectedCat;
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.owasp.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.scenario.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Interactive Vulnerability Catalog
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          Laboratory Modules & Attack Scenarios
        </h1>
        <p style={{ fontSize: '14px', maxWidth: '680px' }}>
          Practice exploitation and defense against OWASP API Security Top 10 vulnerabilities and Model Context Protocol (MCP v1.0) AI agent flaws.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', backgroundColor: 'var(--bg-surface-1)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {MODULE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`tech-btn tech-btn-sm ${selectedCat === cat.id ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ width: '260px' }}>
          <input 
            type="text"
            placeholder="Search scenarios or OWASP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>

      {/* Grid of Exercises */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filtered.map((ex) => (
          <div key={ex.id} className="tech-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge-emerald">{ex.owasp}</span>
                <span className="tech-badge">{ex.difficulty} • {ex.estimatedTime}</span>
              </div>

              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {ex.title}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {ex.scenario}
              </p>
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                Target: Docker Sandbox
              </span>
              <button 
                className="tech-btn tech-btn-sm tech-btn-primary"
                onClick={() => handleLaunchExercise(ex.id)}
                disabled={loadingExId === ex.id}
              >
                {loadingExId === ex.id ? 'Launching...' : 'Launch Lab'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
