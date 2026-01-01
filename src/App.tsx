import React, { useState } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  if (!isAuthenticated) {
    return <Login onLogin={(user) => {
      setIsAuthenticated(true);
      setAdminUser(user);
    }} />;
  }

  return <AdminDashboard adminUser={adminUser} onLogout={() => {
    setIsAuthenticated(false);
    setAdminUser(null);
  }} />;
}
