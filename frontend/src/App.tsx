import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { RequirementFormPage } from './pages/RequirementFormPage';
import { RecommendationPage } from './pages/RecommendationPage';
import { DoctorDirectoryPage } from './pages/DoctorDirectoryPage';
import { BookingPage } from './pages/BookingPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { QueueTrackerPage } from './pages/QueueTrackerPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { StockQuantityPage } from './pages/StockQuantityPage';

import { User } from './types';
import { apiClient, getStoredData, setStoredData, supabase } from './services/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    return getStoredData<User | null>('current_user', null);
  });

  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data?.session?.user) {
          const authUser = session.data.session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          const activeUser: User = {
            id: authUser.id,
            email: authUser.email || '',
            role: (profile?.role || authUser.user_metadata?.role || 'PATIENT') as any,
            fullName: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            patientProfileId: authUser.id,
            doctorProfileId: profile?.doctor_profile_id,
          };
          setUser(activeUser);
          setStoredData('current_user', activeUser);
        }
      } catch (e) {
        console.warn('Session sync note:', e);
      }
    };
    initSession();
  }, []);

  const handleLoginSuccess = (userObj: User, token: string) => {
    setUser(userObj);
    localStorage.setItem('auth_token', token);
    setStoredData('current_user', userObj);
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('hms_app_state_v1_current_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-surface font-sans text-mineral-900 selection:bg-sage-400/30">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<AuthPage mode="register" onLoginSuccess={handleLoginSuccess} />} />

            <Route path="/recommendation" element={<RecommendationPage />} />
            <Route path="/doctors" element={<DoctorDirectoryPage />} />
            <Route path="/departments" element={<RecommendationPage />} />
            <Route path="/stock" element={<StockQuantityPage />} />

            <Route path="/requirement-form" element={<RequirementFormPage user={user} />} />
            <Route path="/booking" element={<BookingPage user={user} />} />

            {/* Protected Patient Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user} allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
                  <PatientProfilePage user={user!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['PATIENT']}>
                  <PatientDashboardPage user={user!} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/queue-tracker"
              element={<QueueTrackerPage />}
            />

            {/* Protected Doctor Routes */}
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['DOCTOR', 'ADMIN']}>
                  <DoctorDashboardPage user={user!} />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['ADMIN']}>
                  <AdminDashboardPage user={user!} />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
