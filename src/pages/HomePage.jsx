import React from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';

export default function HomePage({ navigate, isAuthenticated }) {
  const cardsData = [
    {
      owasp: 'API1:2023',
      difficulty: 'BEGINNER',
      difficultyBadgeClass: 'badge-cyan',
      title: 'Broken Object Level Authorization',
      description: "Access other users' resources by manipulating object identifiers in API requests.",
      route: 'GET /api/v1/users/{id}/invoices'
    },
    {
      owasp: 'API2:2023',
      difficulty: 'INTERMEDIATE',
      difficultyBadgeClass: 'badge-amber',
      title: 'Broken Authentication',
      description: 'Exploit weak token handling and credential stuffing to hijack sessions.',
      route: 'POST /api/v1/auth/refresh'
    },
    {
      owasp: 'API3:2023',
      difficulty: 'INTERMEDIATE',
      difficultyBadgeClass: 'badge-amber',
      title: 'Broken Object Property Level Authorization',
      description: "Excessive data exposure & mass assignment — write to properties you shouldn't control.",
      route: 'PATCH /api/v1/users/me'
    },
    {
      owasp: 'API4:2023',
      difficulty: 'BEGINNER',
      difficultyBadgeClass: 'badge-cyan',
      title: 'Unrestricted Resource Consumption',
      description: 'Trigger denial-of-service via unbounded pagination and missing rate limits.',
      route: 'GET /api/v1/products'
    },
    {
      owasp: 'API5:2023',
      difficulty: 'ADVANCED',
      difficultyBadgeClass: 'badge-red',
      title: 'Broken Function Level Authorization',
      description: 'Invoke administrative functions as a low-privileged user.',
      route: 'DELETE /api/v1/admin/users/{id}'
    },
    {
      owasp: 'API7:2023',
      difficulty: 'ADVANCED',
      difficultyBadgeClass: 'badge-red',
      title: 'Server Side Request Forgery',
      description: 'Coerce the server into making requests to internal metadata services.',
      route: 'POST /api/v1/fetch-avatar'
    }
  ];

  const handleAction = () => {
    if (isAuthenticated) {
      navigate('/modules');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', paddingBottom: '48px' }}>
      
      {/* Authentication Callout Banner if Unauthenticated */}
      {!isAuthenticated && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 20px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', fontWeight: '700' }}>
            <Lock size={16} />
            <span>AUTHENTICATION REQUIRED: Sign in or create an account to access the interactive Docker labs.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
            <button className="tech-btn tech-btn-sm tech-btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section style={{ maxWidth: '960px', marginTop: '12px' }}>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--brand-orange)', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px' }}>
          // OWASP API SECURITY TOP 10 • HANDS-ON LABS
        </div>

        <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.05', color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '24px' }}>
          Hack to learn.<br />
          Defend to win.<br />
          Break the API,<br />
          <span style={{ color: 'var(--brand-orange)' }}>ship it safe.</span>
        </h1>

        <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', maxWidth: '540px', marginBottom: '32px' }}>
          A deliberately vulnerable API platform where you exploit real flaws inside isolated Docker containers.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="tech-btn tech-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={handleAction}>
            <span>{isAuthenticated ? 'Enter Training Workspace' : 'Sign in to Start Hacking'}</span>
            <ArrowUpRight size={16} />
          </button>

          {!isAuthenticated && (
            <button className="tech-btn tech-btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={() => navigate('/signup')}>
              <span>Create Account</span>
            </button>
          )}
        </div>
      </section>

      {/* 6 Vulnerability Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {cardsData.map((card, idx) => (
          <div 
            key={idx} 
            className="tech-card" 
            onClick={handleAction}
            style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>{card.owasp}</span>
                <span className={`tech-badge ${card.difficultyBadgeClass}`}>{card.difficulty}</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', lineHeight: '1.3' }}>
                {card.title}
              </h3>

              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {card.description}
              </p>
            </div>

            <div className="mono" style={{ fontSize: '11px', color: '#0d9488', marginTop: '16px' }}>
              {card.route}
            </div>
          </div>
        ))}
      </section>

      {/* Bottom Bright Orange Banner */}
      <section style={{ background: 'var(--brand-orange)', borderRadius: 'var(--radius-md)', padding: '48px 40px', color: '#ffffff' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Ready to break something on purpose?
        </h2>
        <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '24px' }}>
          Sign in or create an account to start your hands-on Docker container labs.
        </p>
        <button className="tech-btn tech-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }} onClick={() => navigate(isAuthenticated ? '/modules' : '/signup')}>
          {isAuthenticated ? 'Go to Catalog' : 'Create free account'}
        </button>
      </section>

    </div>
  );
}
