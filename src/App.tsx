import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { HomePlannerPage } from './pages/HomePlannerPage';
import { PartyPlannerPage } from './pages/PartyPlannerPage';
import { JewelryPlannerPage } from './pages/JewelryPlannerPage';
import { HomeRecommendationsPage } from './pages/HomeRecommendationsPage';
import { PartyRecommendationsPage } from './pages/PartyRecommendationsPage';
import { JewelryRecommendationsPage } from './pages/JewelryRecommendationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { PlanDetailPage } from './pages/PlanDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="p-12 max-w-md mx-auto" role="status" aria-live="polite">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4 mb-4" />
        <div className="h-4 bg-slate-100 rounded animate-pulse w-full mb-2" />
        <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
        <span className="sr-only">Verifying session...</span>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="p-12 max-w-md mx-auto" role="status" aria-live="polite">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4 mb-4" />
        <div className="h-4 bg-slate-100 rounded animate-pulse w-full mb-2" />
        <span className="sr-only">Verifying session...</span>
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        
        <Route path="login" element={
          <PublicOnlyRoute><AuthPage /></PublicOnlyRoute>
        } />
        <Route path="register" element={
          <PublicOnlyRoute><AuthPage /></PublicOnlyRoute>
        } />
        
        <Route path="dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />

        {/* Planners */}
        <Route path="planner/home" element={
          <ProtectedRoute><HomePlannerPage /></ProtectedRoute>
        } />
        <Route path="planner/party" element={
          <ProtectedRoute><PartyPlannerPage /></ProtectedRoute>
        } />
        <Route path="planner/jewelry" element={
          <ProtectedRoute><JewelryPlannerPage /></ProtectedRoute>
        } />

        {/* Recommendations */}
        <Route path="recommendations/home" element={
          <ProtectedRoute><HomeRecommendationsPage /></ProtectedRoute>
        } />
        <Route path="recommendations/party" element={
          <ProtectedRoute><PartyRecommendationsPage /></ProtectedRoute>
        } />
        <Route path="recommendations/jewelry" element={
          <ProtectedRoute><JewelryRecommendationsPage /></ProtectedRoute>
        } />

        {/* History & Settings */}
        <Route path="history" element={
          <ProtectedRoute><HistoryPage /></ProtectedRoute>
        } />
        <Route path="history/:id" element={
          <ProtectedRoute><PlanDetailPage /></ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        } />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
