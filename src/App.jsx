import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QwenFloatingAssistant from './components/QwenFloatingAssistant';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ModulesPage from './pages/ModulesPage';
import ExercisePage from './pages/ExercisePage';
import AssessmentPage from './pages/AssessmentPage';
import ProgressPage from './pages/ProgressPage';
import AdminPortalPage from './pages/AdminPortalPage';
import InstructorPortalPage from './pages/InstructorPortalPage';
import AssessorPortalPage from './pages/AssessorPortalPage';
import DocsPage from './pages/DocsPage';
import SettingsPage from './pages/SettingsPage';
import PreTestPage from './pages/PreTestPage';
import TrainingOverviewPage from './pages/TrainingOverviewPage';
import PostTestPage from './pages/PostTestPage';
import UsabilityPage from './pages/UsabilityPage';

import { useRouter } from './router';
import { authApi } from './services/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px', maxWidth: '600px', margin: '60px auto', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Workspace Error Caught</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            {this.state.error?.message || "An unhandled runtime error occurred in the workspace component."}
          </p>
          <button 
            className="tech-btn tech-btn-primary"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            Clear Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { currentPath, navigate } = useRouter();
  
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_profile') || localStorage.getItem('user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn("Cleared corrupted profile data from localStorage:", e);
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user');
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('user_profile', JSON.stringify(currentUser));
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (e) {
        console.error("Failed to save user profile:", e);
      }
    }
  }, [currentUser]);

  const basePath = currentPath.split('?')[0];
  const publicPaths = ['/', '/login', '/signup', '/reset-password', '/docs'];
  
  const hasToken = Boolean(localStorage.getItem('token') || localStorage.getItem('access_token'));
  const isAuthenticated = Boolean(currentUser && typeof currentUser === 'object' && hasToken);

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(basePath)) {
      navigate('/login');
    }
  }, [basePath, isAuthenticated]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'enterprise';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const isExerciseRoute = basePath === '/exercise' || currentPath.startsWith('/exercise');
  const isAuthRoute = basePath === '/login' || basePath === '/signup' || basePath === '/reset-password';

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: isExerciseRoute ? 'hidden' : undefined }}>
        
        {!isExerciseRoute && !isAuthRoute && (
          <Navbar 
            currentPath={currentPath}
            navigate={navigate}
            currentUser={currentUser}
            theme={theme}
            setTheme={setTheme}
            setCurrentUser={(user) => {
              setCurrentUser(user);
              if (!user) {
                authApi.logout();
                navigate('/login');
              }
            }}
          />
        )}

        <main 
          className={isExerciseRoute || isAuthRoute ? "" : "main-container"} 
          style={isExerciseRoute || isAuthRoute ? { width: '100vw', minHeight: '100vh', maxWidth: '100%', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } : { flex: 1 }}
        >
          {basePath === '/' && (
            isAuthenticated ? (
              <DashboardPage navigate={navigate} />
            ) : (
              <HomePage navigate={navigate} isAuthenticated={isAuthenticated} />
            )
          )}

          {basePath === '/login' && (
            <LoginPage navigate={navigate} setCurrentUser={setCurrentUser} isAuthenticated={isAuthenticated} />
          )}

          {basePath === '/signup' && (
            <SignupPage navigate={navigate} setCurrentUser={setCurrentUser} isAuthenticated={isAuthenticated} />
          )}

          {basePath === '/reset-password' && (
            <ResetPasswordPage navigate={navigate} />
          )}

          {basePath === '/dashboard' && (
            <DashboardPage navigate={navigate} />
          )}

          {basePath === '/modules' && (
            <ModulesPage navigate={navigate} />
          )}

          {isExerciseRoute && (
            <ExercisePage navigate={navigate} key={currentPath} />
          )}

          {(basePath === '/assessment' || basePath === '/transfer') && (
            <AssessmentPage navigate={navigate} />
          )}

          {basePath === '/pre-test' && (
            <PreTestPage navigate={navigate} />
          )}

          {basePath === '/training' && (
            <TrainingOverviewPage navigate={navigate} />
          )}

          {basePath === '/post-test' && (
            <PostTestPage navigate={navigate} />
          )}

          {basePath === '/usability' && (
            <UsabilityPage navigate={navigate} />
          )}

          {basePath === '/instructor' && (
            <InstructorPortalPage navigate={navigate} />
          )}

          {basePath === '/assessor' && (
            <AssessorPortalPage navigate={navigate} />
          )}

          {(basePath === '/admin-portal' || basePath === '/admin') && (
            <AdminPortalPage navigate={navigate} />
          )}

          {basePath === '/progress' && (
            <ProgressPage navigate={navigate} />
          )}

          {basePath === '/docs' && (
            <DocsPage navigate={navigate} />
          )}

          {basePath === '/settings' && (
            <SettingsPage currentUser={currentUser} navigate={navigate} />
          )}

          {/* Fallback for unknown routes */}
          {!['/', '/login', '/signup', '/reset-password', '/dashboard', '/modules', '/assessment', '/transfer', '/pre-test', '/training', '/post-test', '/usability', '/instructor', '/assessor', '/admin-portal', '/admin', '/progress', '/docs', '/settings'].includes(basePath) && !isExerciseRoute && (
            isAuthenticated ? <DashboardPage navigate={navigate} /> : <HomePage navigate={navigate} isAuthenticated={false} />
          )}

        </main>

        {/* Floating Qwen AI Assistant Component */}
        {isAuthenticated && <QwenFloatingAssistant />}

        {!isExerciseRoute && <Footer navigate={navigate} />}

      </div>
    </ErrorBoundary>
  );
}
