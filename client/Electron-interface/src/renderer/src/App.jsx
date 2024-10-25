import React from 'react';
import { AuthProvider, useAuth } from './components/context/authContext';
import { SessionProvider } from './components/context/sessionContext';
import { ThemeProvider } from './components/context/ThemeContext'; // Importa el ThemeProvider
import Login from './components/login/login';
import Layout from './components/Layout/Layout';
import SignUp from './components/Sing up/SingUp';


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="*" element={isAuthenticated ? <Layout /> : <Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <ThemeProvider> {/* Envuelve tu aplicación con ThemeProvider */}
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;




