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
    } catch {
      navigate(`/exercise?id=${exId}`);
    } finally {
      setLoadingExId(null);
    }
  };

  const safeList = Array.isArray(exercisesList) && exercisesList.length > 0 ? exercisesList : EXERCISES;

  const filteredExercises = safeList.filter(ex => {
    if (!ex) return false;
    const titleStr = String(ex.title || '').toLowerCase();
    const owaspStr = String(ex.owasp || '').toLowerCase();
    const scenarioStr = String(ex.scenario || ex.description || '').toLowerCase();
    const queryStr = String(searchQuery || '').toLowerCase();

    const matchesSearch = !queryStr || 
                          titleStr.includes(queryStr) || 
                          owaspStr.includes(queryStr) ||
                          scenarioStr.includes(queryStr);
    
    const matchesCat = selectedCat === 'all' || ex.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Laboratory Catalog
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Vulnerability Training Modules
        </h1>
        <p style={{ fontSize: '14px', maxWidth: '640px' }}>
          Select an interactive laboratory module to provision an isolated container environment and practice precision exploitation payloads.
        </p>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: '320px', width: '100%' }}>
          <input 
            type="text"
            placeholder="Search exercises by name or flaw..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`tech-btn tech-btn-sm ${selectedCat === 'all' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            onClick={() => setSelectedCat('all')}
          >
            All Modules ({safeList.length})
          </button>
          <button 
            className={`tech-btn tech-btn-sm ${selectedCat === 'bola' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            onClick={() => setSelectedCat('bola')}
          >
            BOLA (API1)
          </button>
          <button 
            className={`tech-btn tech-btn-sm ${selectedCat === 'bfla' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            onClick={() => setSelectedCat('bfla')}
          >
            BFLA (API5)
          </button>
          <button 
            className={`tech-btn tech-btn-sm ${selectedCat === 'property' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            onClick={() => setSelectedCat('property')}
          >
            BOPLA (API3)
          </button>
          <button 
            className={`tech-btn tech-btn-sm ${selectedCat === 'ssrf' ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
            onClick={() => setSelectedCat('ssrf')}
          >
            SSRF (API7)
          </button>
        </div>
      </div>

      {/* Grid of Exercises */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredExercises.map((ex, index) => (
          <div key={ex.id || index} className="tech-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="tech-badge badge-blue">{ex.owasp || 'OWASP API'}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.estimatedTime || '20 min'}</span>
              </div>

              <h3 style={{ fontSize: '16px', marginBottom: '8px', lineHeight: '1.3' }}>
                {ex.title || 'Security Exercise'}
              </h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {ex.scenario || ex.description || 'Hands-on vulnerability exercise.'}
              </p>
            </div>

            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span className="tech-badge">
                {ex.difficulty || 'Intermediate'}
              </span>

              <button 
                className="tech-btn tech-btn-sm tech-btn-primary"
                disabled={loadingExId === ex.id}
                onClick={() => handleLaunchExercise(ex.id)}
              >
                {loadingExId === ex.id ? 'Provisioning...' : 'Launch Lab'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
