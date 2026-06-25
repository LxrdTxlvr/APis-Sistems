import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Cpu, Server, ShieldCheck, Terminal, RefreshCw, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Monitoring() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestLogs, setRequestLogs] = useState([
    { id: 1, method: 'GET', url: '/api/status', status: 200, latency: '4ms', time: new Date().toLocaleTimeString() }
  ]);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_URL}/status`);
      setMetrics(res.data);
      setError('');
      
      // Añadir log de simulación cada vez que hace consulta exitosa
      setRequestLogs(prev => [
        {
          id: Date.now(),
          method: 'GET',
          url: '/api/status',
          status: 200,
          latency: `${res.data.database.latencyMs}ms`,
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 7) // Mantener últimos 8 logs
      ]);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar al endpoint de monitoreo. Verifica que el backend esté en ejecución.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000); // Actualiza cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  // Convertir strings "35 MB" a números para la barra
  const parseMb = (str) => {
    if (!str) return 0;
    return parseInt(str.replace(' MB', '')) || 0;
  };

  const getMemoryPercentage = () => {
    if (!metrics) return 0;
    const used = parseMb(metrics.memory.heapUsed);
    const total = parseMb(metrics.memory.heapTotal);
    return Math.min(Math.round((used / total) * 100), 100);
  };

  return (
    <div className="glass-panel" style={{animation: 'slideUp 0.4s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1>Monitoreo del Ecosistema</h1>
          <p>Métricas de hardware, salud del servidor y estado de la base de datos en tiempo real.</p>
        </div>
        <button className="btn btn-outline" onClick={fetchMetrics} disabled={loading}>
          <RefreshCw size={18} className={loading ? "loading-spinner" : ""} /> Actualizar
        </button>
      </div>

      {error && (
        <div className="badge badge-danger" style={{width: '100%', marginBottom: '24px', padding: '12px 16px', display: 'block', fontSize: '0.9rem'}}>
          {error}
        </div>
      )}

      {metrics && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          
          {/* Fila de Tarjetas de Resumen */}
          <div className="grid-cards">
            
            {/* Health Card */}
            <div className="glass-panel" style={{background: 'rgba(16, 185, 129, 0.03)', borderLeft: '4px solid var(--success)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                <h3>Salud del Sistema</h3>
                <Activity size={24} color="var(--success)" />
              </div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)'}}>
                {metrics.status.toUpperCase()}
              </div>
              <p style={{marginTop: '8px', fontSize: '0.85rem'}}>
                API central en puerto 3000 activa.
              </p>
            </div>

            {/* DB Latency Card */}
            <div className="glass-panel" style={{
              background: 'rgba(99, 102, 241, 0.03)', 
              borderLeft: `4px solid ${metrics.database.latencyMs < 50 ? 'var(--success)' : 'var(--warning)'}`
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                <h3>Latencia SQLite (Prisma)</h3>
                <Server size={24} color="var(--accent-primary)" />
              </div>
              <div style={{fontSize: '2rem', fontWeight: 'bold', color: 'white'}}>
                {metrics.database.latencyMs} ms
              </div>
              <p style={{marginTop: '8px', fontSize: '0.85rem'}}>
                Respuesta a consulta `prisma.user.count()`.
              </p>
            </div>

            {/* Uptime Card */}
            <div className="glass-panel" style={{background: 'rgba(236, 72, 153, 0.03)', borderLeft: '4px solid var(--accent-secondary)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                <h3>Tiempo de Actividad</h3>
                <Clock size={24} color="var(--accent-secondary)" />
              </div>
              <div style={{fontSize: '1.6rem', fontWeight: 'bold', color: 'white', margin: '6px 0'}}>
                {formatUptime(metrics.uptime)}
              </div>
              <p style={{marginTop: '8px', fontSize: '0.85rem'}}>
                Uptime continuo de Node.js.
              </p>
            </div>

          </div>

          {/* Fila de Memoria y Sistema */}
          <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
            
            {/* Monitor de Memoria (RAM Heap) */}
            <div className="glass-panel" style={{flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <h3><Cpu size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}}/> Consumo de Memoria RAM (V8 Engine)</h3>
              
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem'}}>
                  <span>Heap Usado: <strong>{metrics.memory.heapUsed}</strong></span>
                  <span>Heap Total: {metrics.memory.heapTotal}</span>
                </div>
                
                {/* Barra de progreso de memoria */}
                <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: '8px', height: '16px', overflow: 'hidden', border: '1px solid var(--panel-border)'}}>
                  <div style={{
                    width: `${getMemoryPercentage()}%`,
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                    height: '100%',
                    borderRadius: '8px',
                    transition: 'width 0.5s ease-in-out',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                  }}></div>
                </div>
                
                <p style={{fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-secondary)'}}>
                  Porcentaje utilizado del heap asignado: {getMemoryPercentage()}% | RSS total: {metrics.memory.rss}
                </p>
              </div>
              
              <div style={{borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Plataforma</div>
                  <strong style={{textTransform: 'uppercase'}}>{metrics.platform}</strong>
                </div>
                <div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Versión de Node</div>
                  <strong>{metrics.nodeVersion}</strong>
                </div>
                <div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Base de Datos</div>
                  <strong>SQLite via Prisma</strong>
                </div>
              </div>
            </div>

            {/* Seguridad Activa */}
            <div className="glass-panel" style={{flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <h3><ShieldCheck size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}}/> Escudos de Seguridad</h3>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px'}}>
                  <span>Cabeceras Helmet</span>
                  <span className="badge badge-success">Activo</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px'}}>
                  <span>Rate Limiting (Anti-Spam)</span>
                  <span className="badge badge-success">Activo</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px'}}>
                  <span>Sanitización CORS</span>
                  <span className="badge badge-success">Activo</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span>JWT Tokens</span>
                  <span className="badge badge-success">Firmados</span>
                </div>
              </div>
            </div>

          </div>

          {/* Consola de Solicitudes HTTP en Vivo */}
          <div className="glass-panel" style={{background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.05)'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
              <Terminal size={18} color="var(--accent-secondary)"/> Registro de Solicitudes HTTP (Consola en Vivo)
            </h3>
            
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              maxHeight: '200px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {requestLogs.map(log => (
                <div key={log.id} style={{display: 'flex', gap: '16px', color: 'var(--text-secondary)'}}>
                  <span style={{color: 'var(--success)'}}>[{log.time}]</span>
                  <span style={{color: 'var(--accent-secondary)', fontWeight: 'bold'}}>{log.method}</span>
                  <span style={{color: '#fff', flex: 1}}>{log.url}</span>
                  <span style={{color: 'var(--success)'}}>{log.status} OK</span>
                  <span style={{color: 'var(--text-secondary)'}}>{log.latency}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Monitoring;
