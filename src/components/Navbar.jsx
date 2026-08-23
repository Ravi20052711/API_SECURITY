import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ currentPath, navigate, currentUser, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <header className="sys-header" style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        
        {/* Brand Logo */}
        <div className="sys-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="sys-logo-icon">&gt;_</span>
          <span>HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span></span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--brand-orange)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right User Actions (Desktop) */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                {currentUser?.first_name || currentUser?.name || currentUser?.email || 'User'}
              </span>
              <button 
                className="tech-btn tech-btn-sm tech-btn-secondary"
                onClick={() => {
                  localStorage.clear();
                  setCurrentUser(null);
                  navigate('/login');
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button className="tech-btn tech-btn-sm tech-btn-secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="tech-btn tech-btn-sm tech-btn-primary" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#0f172a', padding: '6px', cursor: 'pointer', display: 'none' }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '12px 0 8px', borderTop: '1px solid #e2e8f0', gap: '8px' }}>
          {baseLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                style={{
                  background: isActive ? '#fff7ed' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--brand-orange)' : '#334155',
                  cursor: 'pointer'
                }}
              >
                {link.label}
              </button>
            );
          })}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            {isAuthenticated ? (
              <button 
                className="tech-btn tech-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  localStorage.clear();
                  setCurrentUser(null);
                  navigate('/login');
                }}
              >
                Log Out ({currentUser?.first_name || 'User'})
              </button>
            ) : (
              <>
                <button className="tech-btn tech-btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                  Sign In
                </button>
                <button className="tech-btn tech-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
