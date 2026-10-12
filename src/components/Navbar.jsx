import React, { useState } from 'react';

export default function Navbar({ currentPath, navigate, currentUser, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = Boolean(currentUser && typeof currentUser === 'object' && (localStorage.getItem('token') || localStorage.getItem('access_token') || currentUser?.email));
  const role = currentUser?.role || 'student';

  const baseLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/modules', label: 'Modules' },
    { path: '/assessment', label: 'Transfer Lab' },
    { path: '/progress', label: 'Analytics' },
    { path: '/docs', label: 'Docs' },
  ];

  if (isAuthenticated) {
    if (role === 'instructor' || role === 'admin') {
      baseLinks.splice(4, 0, { path: '/instructor', label: 'Instructor' });
    }
    if (role === 'assessor' || role === 'admin') {
      baseLinks.splice(4, 0, { path: '/assessor', label: 'Assessor' });
    }
    if (role === 'admin') {
      baseLinks.splice(4, 0, { path: '/admin-portal', label: 'Admin' });
    }
  }

  const handleNavClick = (targetPath) => {
    setMobileMenuOpen(false);
    if (!isAuthenticated && targetPath !== '/docs' && targetPath !== '/') {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'saturate(180%) blur(12px)',
      WebkitBackdropFilter: 'saturate(180%) blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      height: 'var(--header-height)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Mark & Isolation Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => navigate('/')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '14px'
            }}>
              API
            </div>
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}>
              APISEC_BENCH
            </span>
          </div>

          <span className="badge-emerald" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ISOLATED DOCKER SANDBOX
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="nav-desktop">
          {baseLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px 0',
                  borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  transition: 'color 0.15s ease'
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="nav-desktop">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {currentUser?.first_name || currentUser?.name || currentUser?.email}
              </span>
              <button
                className="tech-btn tech-btn-sm tech-btn-secondary"
                onClick={() => {
                  localStorage.clear();
                  setCurrentUser(null);
                  navigate('/login');
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="tech-btn tech-btn-sm tech-btn-secondary"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
              <button
                className="tech-btn tech-btn-sm tech-btn-primary"
                onClick={() => navigate('/signup')}
              >
                Get started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            padding: '6px',
            cursor: 'pointer',
            display: 'none',
            color: 'var(--text-primary)'
          }}
          className="nav-mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileMenuOpen ? (
              <path d="M5 5L15 15M15 5L5 15" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface-1)',
          borderBottom: '1px solid var(--border-standard)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {baseLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontSize: '14px',
                padding: '8px 0',
                color: currentPath === link.path ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: currentPath === link.path ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              {link.label}
            </button>
          ))}

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
            {isAuthenticated ? (
              <button
                className="tech-btn tech-btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  localStorage.clear();
                  setCurrentUser(null);
                  navigate('/login');
                }}
              >
                Sign out
              </button>
            ) : (
              <>
                <button
                  className="tech-btn tech-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                >
                  Sign in
                </button>
                <button
                  className="tech-btn tech-btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
