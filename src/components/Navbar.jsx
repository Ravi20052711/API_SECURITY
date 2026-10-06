import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ currentPath, navigate, currentUser, setCurrentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = Boolean(currentUser && typeof currentUser === 'object' && (localStorage.getItem('token') || localStorage.getItem('access_token') || currentUser?.email));
  const role = currentUser?.role || 'student';

  const baseLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/modules', label: 'Modules' },
    { path: '/assessment', label: 'Transfer Assessment' },
    { path: '/progress', label: 'Progress' },
  ];

  if (isAuthenticated) {
    if (role === 'instructor' || role === 'admin') {
      baseLinks.push({ path: '/instructor', label: 'Instructor Portal' });
    }
    if (role === 'assessor' || role === 'admin') {
      baseLinks.push({ path: '/assessor', label: 'Assessor Portal' });
    }
    if (role === 'admin') {
      baseLinks.push({ path: '/admin-portal', label: 'Admin Portal' });
    }
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
    <header className="sys-header" style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#000000', borderBottom: '1px solid #1e293b', padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Brand Logo with Existing Project Logo */}
        <div className="sys-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="sys-logo-icon" style={{ background: 'var(--brand-orange)', color: '#000000', padding: '4px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '13px' }}>&gt;_</span>
          <span className="sys-logo-text" style={{ color: '#ffffff', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            HackTheAPI<span style={{ color: 'var(--brand-orange)' }}>.</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
                  color: isActive ? 'var(--brand-orange)' : '#cbd5e1',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease'
                }}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right User Actions (TCS XPLORE Style Outline Button + Logo Mark) */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>
                {currentUser?.first_name || currentUser?.name || currentUser?.email || 'User'}
              </span>
              <button 
                style={{
                  background: 'transparent',
                  border: '1px solid #ffffff',
                  color: '#ffffff',
                  padding: '6px 18px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
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
              <button 
                style={{
                  background: 'transparent',
                  border: '1px solid #ffffff',
                  color: '#ffffff',
                  padding: '6px 20px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </>
          )}

          {/* Secondary Brand Icon (Matching TATA logo mark on right) */}
          <div 
            onClick={() => navigate('/')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: '#1e293b',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '13px',
              cursor: 'pointer'
            }}
            title="HackTheAPI Security Lab"
          >
            &gt;_
          </div>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#ffffff', padding: '6px', cursor: 'pointer', display: 'none' }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '12px 0 8px', borderTop: '1px solid #1e293b', gap: '8px', marginTop: '12px' }}>
          {baseLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                style={{
                  background: isActive ? '#1e293b' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--brand-orange)' : '#e2e8f0',
                  cursor: 'pointer'
                }}
              >
                {link.label}
              </button>
            );
          })}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
            {isAuthenticated ? (
              <button 
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #ffffff',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onClick={() => {
                  localStorage.clear();
                  setCurrentUser(null);
                  navigate('/login');
                }}
              >
                Log Out ({currentUser?.first_name || 'User'})
              </button>
            ) : (
              <button 
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #ffffff',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
