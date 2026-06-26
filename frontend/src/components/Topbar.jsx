import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Search } from 'lucide-react';
import './Topbar.css';

const ALL_ROUTES = [
  { path: '/dashboard',  label: 'Panel General',        keywords: ['dashboard', 'panel', 'resumen', 'inicio', 'home'] },
  { path: '/users',      label: 'API Usuarios',         keywords: ['usuarios', 'users', 'api', 'admin'], adminOnly: true },
  { path: '/tasks',      label: 'API Tareas',           keywords: ['tareas', 'tasks', 'pendiente', 'completar'] },
  { path: '/store',      label: 'API Tienda / Inventario', keywords: ['tienda', 'store', 'productos', 'inventario', 'carrito', 'comprar'] },
  { path: '/payments',   label: 'API Pagos (Stripe)',   keywords: ['pagos', 'payments', 'stripe', 'cobro', 'pago'] },
  { path: '/weather',    label: 'API Clima',            keywords: ['clima', 'weather', 'temperatura', 'ciudad', 'tiempo'] },
  { path: '/ai',         label: 'Asistente IA (Gemini)', keywords: ['ia', 'ai', 'gemini', 'chat', 'inteligencia', 'asistente'] },
  { path: '/monitoring', label: 'API Monitoreo',        keywords: ['monitoreo', 'monitoring', 'status', 'servidor', 'estado'], adminOnly: true },
];

function Topbar() {
  const { user: authUser, logout: authLogout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const getFilteredRoutes = (q) => {
    const lower = q.toLowerCase().trim();
    if (!lower) return [];
    return ALL_ROUTES.filter(route => {
      if (route.adminOnly && authUser?.role !== 'ADMIN') return false;
      return (
        route.label.toLowerCase().includes(lower) ||
        route.keywords.some(k => k.includes(lower))
      );
    });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    const filtered = getFilteredRoutes(val);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSelect = (path) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex].path);
      } else if (suggestions.length === 1) {
        handleSelect(suggestions[0].path);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar glass-panel">
      <div className="topbar-search" ref={containerRef} style={{ position: 'relative' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            color="var(--text-secondary)"
            style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar en el sistema..."
            className="input-field"
            style={{ paddingLeft: '40px' }}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setShowSuggestions(suggestions.length > 0)}
            autoComplete="off"
          />
        </div>

        {/* Dropdown de sugerencias */}
        {showSuggestions && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--panel-bg)',
            border: '1px solid var(--panel-border)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)',
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            {suggestions.map((item, idx) => (
              <div
                key={item.path}
                onMouseDown={() => handleSelect(item.path)}
                onMouseEnter={() => setActiveIndex(idx)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: idx === activeIndex
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'transparent',
                  borderLeft: idx === activeIndex
                    ? '3px solid var(--accent-primary)'
                    : '3px solid transparent',
                  transition: 'all 0.15s',
                  color: idx === activeIndex ? '#fff' : 'var(--text-secondary)',
                }}
              >
                <Search size={14} />
                <span style={{ fontWeight: idx === activeIndex ? 500 : 400 }}>
                  {item.label}
                </span>
              </div>
            ))}
            <div style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--panel-border)',
              opacity: 0.6,
            }}>
              ↑↓ para navegar • Enter para seleccionar • Esc para cerrar
            </div>
          </div>
        )}
      </div>

      <div className="topbar-profile" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="avatar"
            style={{ background: authUser?.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--accent-secondary)' }}
          >
            {getInitials(authUser?.name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{authUser?.name || 'Usuario'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {authUser?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
        </div>
        <button
          onClick={authLogout}
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
