import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Store, CreditCard, CloudSun, Bot, Activity } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Resumen', icon: <LayoutDashboard size={20} /> },
  { path: '/users', label: 'API Usuarios', icon: <Users size={20} /> },
  { path: '/tasks', label: 'API Tareas', icon: <CheckSquare size={20} /> },
  { path: '/store', label: 'API Tienda', icon: <Store size={20} /> },
  { path: '/payments', label: 'API Pagos', icon: <CreditCard size={20} /> },
  { path: '/weather', label: 'API Clima', icon: <CloudSun size={20} /> },
  { path: '/ai', label: 'API IA Chat', icon: <Bot size={20} /> },
  { path: '/monitoring', label: 'API Monitoreo', icon: <Activity size={20} /> },
];

function Sidebar() {
  return (
    <aside className="sidebar glass-panel" style={{ borderRadius: '0 16px 16px 0', borderLeft: 'none' }}>
      <div className="sidebar-header" style={{ marginBottom: '32px' }}>
        <h2 style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Ecosistema API
        </h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.2), transparent)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.2s',
              marginBottom: '8px'
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
