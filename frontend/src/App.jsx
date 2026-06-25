import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Pages
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Tasks from './pages/Tasks';
import Store from './pages/Store';
import Payments from './pages/Payments';
import Weather from './pages/Weather';
import AI from './pages/AI';
import Monitoring from './pages/Monitoring';
import Login from './pages/Login';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

import './index.css';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, token } = useAuth();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AI /></ProtectedRoute>} />
          
          {/* Rutas Protegidas para ADMIN */}
          <Route path="/users" element={<ProtectedRoute requireAdmin={true}><Users /></ProtectedRoute>} />
          <Route path="/monitoring" element={<ProtectedRoute requireAdmin={true}><Monitoring /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
