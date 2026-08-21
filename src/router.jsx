import { useState, useEffect } from 'react';

// Lightweight client-side router supporting paths, query parameters, and back/forward navigation
export function useRouter() {
  const getPath = () => (window.location.pathname || '/') + (window.location.search || '');
  const [currentPath, setCurrentPath] = useState(getPath());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname || '/') + (window.location.search || ''));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  return { currentPath, navigate };
}
