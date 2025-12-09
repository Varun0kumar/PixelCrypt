// src/App.js
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// This import is KEY. It links to the file you updated in Step 1.
import DashboardPage from './pages/DashboardPage'; 

const App = () => {
  const [view, setView] = useState('login');

  const handleLoginSuccess = () => setView('dashboard');
  const handleLogout = () => setView('login');

  if (view === 'dashboard') {
    return <DashboardPage onLogout={handleLogout} />;
  }
  if (view === 'signup') {
    return <SignupPage onNavigate={setView} onSignup={handleLoginSuccess} />;
  }
  return <LoginPage onNavigate={setView} onLogin={handleLoginSuccess} />;
};

export default App;