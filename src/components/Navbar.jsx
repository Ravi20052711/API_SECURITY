import React from 'react';

export default function Navbar({ currentPath, navigate, currentUser, setCurrentUser }) {
  const isAuthenticated = Boolean(currentUser && (localStorage.getItem('token') || localStorage.getItem('access_token') || currentUser.email));
  const role = currentUser?.role || 'student';

  const baseLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/modules', label: 'Modules' },
    { path: '/assessment', label: 'Transfer Assessment' },
    { path: '/progress', label: 'Progress' },
  ];

  if (role === 'instructor' || role === 'admin') {
    baseLinks.push({ path: '/instructor', label: 'Instructor Portal' });
  }

  if (role === 'assessor' || role === 'admin') {
    baseLinks.push({ path: '/assessor', label: 'Assessor Portal' });
  }

  if (role === 'admin') {
    baseLinks.push({ path: '/admin-portal', label: 'Admin Portal' });
  }

  baseLinks.push({ path: '/docs', label: 'Docs' });

  const handleNavClick = (targetPath) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <header className="sys-header">
      {/* Brand Logo */}
      <div className="sys-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="sys-logo-icon">&gt;_</span>
        <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                fontWeight: isActive ? '700' : '400',
                color: isActive ? 'var(--brand-orange)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              background: role === 'admin' ? '#7f1d1d' : (role === 'instructor' ? '#1e40af' : (role === 'assessor' ? '#6b21a8' : '#1b1464')),
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {currentUser?.username || currentUser?.name || 'User'} ({role})
            </span>
            <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => setCurrentUser(null)} style={{ marginLeft: '4px' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="tech-btn tech-btn-sm" onClick={() => navigate('/login')}>Sign In</button>
            <button className="tech-btn tech-btn-sm tech-btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
}
