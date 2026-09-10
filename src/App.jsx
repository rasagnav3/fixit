import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingState from './components/LoadingState';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import AllIssues from './pages/AllIssues';
import IssueDetails from './pages/IssueDetails';
import CampusMap from './pages/CampusMap';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminIssues from './pages/admin/AdminIssues';
import AdminIssueDetails from './pages/admin/AdminIssueDetails';
import Analytics from './pages/admin/Analytics';

// Services
import { authService } from './services/authService';
import { isSupabaseConfigured } from './lib/supabase';

export function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const refreshUserData = async () => {
    if (!isSupabaseConfigured()) {
      setLoadingAuth(false);
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const userProfile = await authService.getProfile(user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn('Error verifying session:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    refreshUserData();

    // Listen to Supabase auth events (sign in, sign out, token refresh)
    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        const p = await authService.getProfile(session.user.id);
        setProfile(p);
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setLoadingAuth(false);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar
          currentUser={currentUser}
          profile={profile}
          onLogout={handleLogout}
        />

        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home currentUser={currentUser} />} />
            <Route path="/login" element={<Login onAuthSuccess={refreshUserData} />} />
            <Route path="/issues" element={<AllIssues currentUser={currentUser} />} />
            <Route path="/issues/:id" element={<IssueDetails currentUser={currentUser} profile={profile} />} />
            <Route path="/map" element={<CampusMap />} />

            {/* Protected Student Routes */}
            <Route
              path="/report"
              element={
                <ProtectedRoute currentUser={currentUser} profile={profile} loading={loadingAuth}>
                  <ReportIssue currentUser={currentUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute currentUser={currentUser} profile={profile} loading={loadingAuth}>
                  <MyReports currentUser={currentUser} />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute currentUser={currentUser} profile={profile} loading={loadingAuth} requireAdmin={true}>
                  <AdminDashboard currentUser={currentUser} profile={profile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issues"
              element={
                <ProtectedRoute currentUser={currentUser} profile={profile} loading={loadingAuth} requireAdmin={true}>
                  <AdminIssues currentUser={currentUser} profile={profile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/issues/:id"
              element={
                <ProtectedRoute currentUser={currentUser} profile={profile} loading={loadingAuth} requireAdmin={true}>
                  <AdminIssueDetails currentUser={currentUser} profile={profile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute currentUser={currentUser} profile={profile} loading={loadingAuth} requireAdmin={true}>
                  <Analytics currentUser={currentUser} profile={profile} />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <BottomNav currentUser={currentUser} profile={profile} />
      </div>
    </BrowserRouter>
  );
}

export default App;
