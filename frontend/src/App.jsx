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

import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/store" element={<Store />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/monitoring" element={<Monitoring />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
