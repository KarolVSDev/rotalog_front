import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { AuthResult } from './services/auth';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('rotalog-jwt'));
  });
  const [companyName, setCompanyName] = useState<string>(() => {
    return localStorage.getItem('rotalog-company') || 'Fornecedor';
  });

  const handleLogin = ({ token, companyName: loggedCompany }: AuthResult) => {
    localStorage.setItem('rotalog-jwt', token);
    localStorage.setItem('rotalog-company', loggedCompany);
    setCompanyName(loggedCompany);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('rotalog-jwt');
    localStorage.removeItem('rotalog-company');
    setCompanyName('Fornecedor');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <LoginPage theme={theme} toggleTheme={toggleTheme} onLogin={handleLogin} />
          }
        />
        <Route
          path="/cadastro"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <RegisterPage theme={theme} toggleTheme={toggleTheme} onRegister={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? <DashboardPage theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} companyName={companyName} />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;