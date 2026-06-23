import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, Users, CreditCard, Cloud, Bot, ShoppingBag, CheckCircle } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    status: 'Conectando...',
    users: 0,
    tasks: 0,
    products: 0
  });

  useEffect(() => {
    // Simulamos la carga de estadísticas globales pegando a un par de endpoints rápidos o mockeando
    setTimeout(() => {
      setStats({
        status: 'Online',
        users: 15,
        tasks: 48,
        products: 120
      });
    }, 1500);
  }, []);

  return (
    <div className="glass-panel" style={{borderTop: '4px solid var(--accent-primary)'}}>
      <h1>Panel General</h1>
      <p>Bienvenido al Centro de Control de tus 7 APIs. Todo el ecosistema está monitoreado desde aquí.</p>
      
      <div className="grid-cards" style={{marginTop: '32px'}}>
        
        {/* Status Card */}
        <div className="glass-panel" style={{background: 'rgba(99, 102, 241, 0.05)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>Estado del Sistema</h3>
            <Activity className="icon" color="var(--accent-primary)" />
          </div>
          <div style={{fontSize: '2rem', fontWeight: 'bold', marginTop: '10px', color: stats.status === 'Online' ? 'var(--success)' : 'var(--warning)'}}>
            {stats.status}
          </div>
          <p style={{marginTop: '10px', fontSize: '0.9rem'}}>Servidor Express.js (Puerto 3000)</p>
        </div>

        {/* Ecosistema */}
        <div className="glass-panel">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>Métricas Locales (SQLite)</h3>
            <Server className="icon" color="var(--accent-secondary)" />
          </div>
          <div style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'8px'}}>
              <span style={{display:'flex', gap:'8px', alignItems:'center'}}><Users size={16}/> Usuarios</span>
              <strong>{stats.users}</strong>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'8px'}}>
              <span style={{display:'flex', gap:'8px', alignItems:'center'}}><CheckCircle size={16}/> Tareas</span>
              <strong>{stats.tasks}</strong>
            </div>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{display:'flex', gap:'8px', alignItems:'center'}}><ShoppingBag size={16}/> Productos</span>
              <strong>{stats.products}</strong>
            </div>
          </div>
        </div>

        {/* APIs Externas */}
        <div className="glass-panel">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>Integraciones Externas</h3>
            <Cloud className="icon" color="#38bdf8" />
          </div>
          <div style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
              <CreditCard size={24} color="#a78bfa" />
              <div>
                <div style={{fontWeight:'500'}}>Stripe API</div>
                <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Simulador de Pagos Activo</div>
              </div>
            </div>
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
              <Cloud size={24} color="#38bdf8" />
              <div>
                <div style={{fontWeight:'500'}}>OpenWeatherMap</div>
                <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Servicio Climatológico</div>
              </div>
            </div>
            <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
              <Bot size={24} color="#f472b6" />
              <div>
                <div style={{fontWeight:'500'}}>Google Gemini 1.5</div>
                <div style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>IA Conversacional</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
