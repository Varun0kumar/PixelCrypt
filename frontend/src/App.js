import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

const firebaseConfig = {
  apiKey: "AIzaSyA9bEVAjPd2Jyjr50l01ZvrONHB4oq1Cqs",
  authDomain: "pixelcrypt-b84fe.firebaseapp.com",
  projectId: "pixelcrypt-b84fe",
  appId: "1:607789442226:web:dda6f9a2d14594abc995ab"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [currentPage, setCurrentPage] = useState(null);
  const [user, setUser] = useState(null);          // Firebase user
  const [ghostUser, setGhostUser] = useState(null); // Ghost user
  const [loading, setLoading] = useState(true);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Logout (clears both real + ghost)
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setGhostUser(null);
    setCurrentPage('landing');
  };
  if (currentPage === null) {
  return <LandingPage onNavigate={setCurrentPage} />;
}

  const renderPage = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-black text-green-500 flex items-center justify-center font-mono">
          Initializing System...
        </div>
      );
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;

      case 'login':
        return (
          <LoginPage
            onNavigate={setCurrentPage}
            onLogin={(data) => {
              if (data?.bypass) {
                setGhostUser(data);   // 👻 ghost login
              }
              setCurrentPage('dashboard');
            }}
          />
        );

      case 'signup':
        return (
          <SignupPage
            onNavigate={setCurrentPage}
            onSignup={() => setCurrentPage('login')}
          />
        );

      case 'dashboard':
        // ✅ SINGLE SOURCE OF TRUTH
        if (!user && !ghostUser) {
          return (
            <LoginPage
              onNavigate={setCurrentPage}
              onLogin={(data) => {
                if (data?.bypass) {
                  setGhostUser(data);
                }
                setCurrentPage('dashboard');
              }}
            />
          );
        }

        return <DashboardPage onLogout={handleLogout} />;

      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return <>{renderPage()}</>;
}

export default App;
