import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';
import { clearStoredSession, getStoredToken, setStoredSession } from './lib/auth';
import { getMe } from './lib/api';
import type { User } from './lib/models';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeSession = async () => {
      const token = getStoredToken();

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const user = await getMe();
        if (user.role !== 'admin') {
          clearStoredSession();
          setIsAuthenticated(false);
          setAdminUser(null);
          setIsCheckingAuth(false);
          return;
        }

        setStoredSession(token, user);
        setAdminUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error restoring session:', err);
        clearStoredSession();
        setIsAuthenticated(false);
        setAdminUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializeSession();
  }, []);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login
          onLogin={(session) => {
            setStoredSession(session.token, session.user);
            setIsAuthenticated(true);
            setAdminUser(session.user);
          }}
        />
        <Toaster richColors />
      </>
    );
  }

  return (
    <>
      <AdminDashboard
        adminUser={adminUser}
        onLogout={() => {
          clearStoredSession();
          setIsAuthenticated(false);
          setAdminUser(null);
        }}
      />
      <Toaster richColors />
    </>
  );
}
