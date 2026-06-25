import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import './Topbar.css';

function Topbar() {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="topbar glass-panel">
      <div className="topbar-search">
        <input type="text" placeholder="Buscar en el sistema..." className="input-field" />
      </div>
      <div className="topbar-profile" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar" style={{ background: user?.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--accent-secondary)' }}>
            {getInitials(user?.name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{user?.name || 'Usuario'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="btn btn-outline" 
          style={{ padding: '6px 12px', borderColor: 'transparent', color: 'var(--danger)' }}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
