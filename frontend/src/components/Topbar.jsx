import React from 'react';
import './Topbar.css';

function Topbar() {
  return (
    <header className="topbar glass-panel">
      <div className="topbar-search">
        <input type="text" placeholder="Buscar en el sistema..." className="input-field" />
      </div>
      <div className="topbar-profile">
        <div className="avatar">AD</div>
        <span>Administrador</span>
      </div>
    </header>
  );
}

export default Topbar;
