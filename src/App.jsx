import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SecurityBanner from './components/SecurityBanner';
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

import { useRouter } from './router';
import { authApi } from './services/api';

export default function App() {
  const { currentPath, navigate } = useRouter();
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user_profile') || localStorage.getItem('user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user_profile', JSON.stringify(currentUser));
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const basePath = currentPath.split('?')[0];
  const publicPaths = ['/', '/login', '/signup', '/reset-password'];
  
  const hasToken = Boolean(localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('admin_token'));
  const isAuthenticated = Boolean(currentUser || hasToken);

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(basePath)) {
      navigate('/login');
    }
  }, [basePath, isAuthenticated]);

  const isExerciseRoute = basePath === '/exercise' || currentPath.startsWith('/exercise');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: isExerciseRoute ? 'hidden' : undefined }}>
      
      {!isExerciseRoute && <SecurityBanner />}

      {!isExerciseRoute && (
        <Navbar 
          currentPath={currentPath}
          navigate={navigate}
          currentUser={currentUser}
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
        className={isExerciseRoute ? "" : "main-container"} 
        style={isExerciseRoute ? { width: '100vw', height: '100vh', maxWidth: '100%', margin: 0, padding: 0, flex: 1 } : { flex: 1 }}
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

        {(basePath === '/dashboard' || (basePath === '/' && isAuthenticated)) && (
          <DashboardPage navigate={navigate} />
        )}

        {basePath === '/modules' && (
          <ModulesPage navigate={navigate} />
        )}

        {isExerciseRoute && (
          <ExercisePage navigate={navigate} key={currentPath} />
        )}

        {basePath === '/assessment' && (
          <AssessmentPage navigate={navigate} />
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

      </main>

      {/* Floating Qwen AI Assistant Component (Always Available When Logged In Across All Portals) */}
      {isAuthenticated && <QwenFloatingAssistant />}

      {!isExerciseRoute && <Footer navigate={navigate} />}

    </div>
  );
}
