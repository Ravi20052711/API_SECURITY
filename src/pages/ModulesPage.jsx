import React, { useState, useEffect } from 'react';
import { Search, Clock, Play, RefreshCw, ShieldAlert } from 'lucide-react';
import { EXERCISES, MODULE_CATEGORIES } from '../data/mockData';
import { labApi, exerciseApi } from '../services/api';

const getCategoryFromOwasp = (item) => {
  if (item.category && item.category !== 'all') return item.category;
  const id = (item.id || item.exercise_id || '').toLowerCase();
  const owasp = (item.owasp || '').toLowerCase();
  
  if (id.includes('bola') || owasp.includes('api1')) return 'bola';
  if (id.includes('jwt') || owasp.includes('api2')) return 'auth';
  if (id.includes('mass') || id.includes('nosql') || owasp.includes('api3')) return 'property';
  if (id.includes('rate') || owasp.includes('api4')) return 'resource';
  if (id.includes('bfla') || id.includes('xxe') || owasp.includes('api5')) return 'bfla';
  if (id.includes('ssrf') || owasp.includes('api7')) return 'ssrf';
  if (id.includes('sqli') || id.includes('cors') || owasp.includes('api8')) return 'misconfig';
  if (id.includes('graphql') || owasp.includes('api9')) return 'inventory';
  if (id.includes('cmdi') || owasp.includes('api10')) return 'unsafe_consumption';
  return 'all';
};

export default function ModulesPage({ navigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loadingExId, setLoadingExId] = useState(null);
  const [exercisesList, setExercisesList] = useState(EXERCISES);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    try {
      exerciseApi.getCatalog()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item, idx) => {
              const exId = item.id || item.exercise_id || `ex-${idx}`;
              return {
                id: exId,
                title: item.title || 'OWASP Security Exercise',
                category: getCategoryFromOwasp({ id: exId, owasp: item.owasp, category: item.category }),
                owasp: item.owasp || 'OWASP API TOP 10',
                difficulty: item.difficulty || 'Intermediate',
                estimatedTime: item.estimatedTime || '20 min',
                scenario: item.description || item.scenario || item.problem_statement || 'Hands-on API vulnerability exercise.',
                objective: item.objective || 'Complete the exploitation challenge.'
              };
            });
            setExercisesList(mapped);
          }
        })
        .catch(() => {
          setExercisesList(EXERCISES);
        });
    } catch (err) {
      setRenderError(err.message);
      setExercisesList(EXERCISES);
    }
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

  let filteredExercises = safeList;
  try {
    filteredExercises = safeList.filter(ex => {
      if (!ex) return false;
      const titleStr = String(ex.title || '');
      const owaspStr = String(ex.owasp || '');
      const scenarioStr = String(ex.scenario || ex.problem_statement || '');
      const queryStr = String(searchQuery || '').toLowerCase();

      const matchesSearch = !queryStr || 
                            titleStr.toLowerCase().includes(queryStr) || 
                            owaspStr.toLowerCase().includes(queryStr) ||
                            scenarioStr.toLowerCase().includes(queryStr);
      
      const exCategory = getCategoryFromOwasp(ex);
      const matchesCat = selectedCat === 'all' || exCategory === selectedCat || ex.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  } catch (err) {
    filteredExercises = EXERCISES;
  }

  if (renderError) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '40px auto', maxWidth: '600px' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Catalog View Encountered an Notice</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Restoring static modules catalog fallback...
        </p>
        <button className="tech-btn tech-btn-primary" onClick={() => { setRenderError(null); setExercisesList(EXERCISES); }}>
          <RefreshCw size={14} />
          <span>Reload Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '32px' }}>
      
      {/* Title Header */}
      <div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>
          // OWASP API SECURITY TOP 10 CATALOG • {filteredExercises.length} HANDS-ON LABS DISPLAYED
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Vulnerability Training Catalog
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Select any of the {safeList.length} hands-on OWASP API vulnerability modules below to launch your isolated lab workspace.
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
            All Modules ({safeList.length})
          </button>
          {MODULE_CATEGORIES.filter(c => c && c.id !== 'all').map((cat) => (
            <button 
              key={cat.id}
              className={`tech-btn tech-btn-sm ${selectedCat === cat.id ? 'tech-btn-primary' : 'tech-btn-secondary'}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.name || 'Category'} ({cat.owasp || 'OWASP'})
            </button>
          ))}
        </div>

      </div>

      {/* Module Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredExercises.map((ex, index) => (
          <div key={ex.id || index} className="tech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="tech-badge badge-cyan">{ex.owasp || 'OWASP API TOP 10'}</span>
                <span className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
                  <Clock size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {ex.estimatedTime || '20 min'}
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1.3' }}>
                {ex.title || 'Security Exercise'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' }}>
                {ex.scenario || ex.description || 'Hands-on vulnerability exercise.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="tech-badge badge-amber" style={{ fontSize: '10px' }}>
                {ex.difficulty || 'Intermediate'}
              </span>

              <button 
                className="tech-btn tech-btn-amber"
                disabled={loadingExId === ex.id}
                onClick={() => handleLaunchExercise(ex.id)}
              >
                <span>{loadingExId === ex.id ? 'Launching Container...' : 'Start Lab Workspace'}</span>
                <Play size={13} fill="currentColor" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
