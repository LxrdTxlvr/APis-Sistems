import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Mail, Trash2, Edit2, X, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';
const MOCK_TOKEN = 'mock-token';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/users`, { 
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setFormData({ name: '', email: '', password: '', role: 'USER' });
    setEditUserId(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setEditUserId(user.id);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    try {
      if (editUserId) {
        const putData = { ...formData };
        if (!putData.password) delete putData.password;
        
        await axios.put(`${API_URL}/users/${editUserId}`, putData, {
          headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
      } else {
        if (!formData.password) {
          throw new Error('La contraseña es requerida para nuevos usuarios');
        }
        await axios.post(`${API_URL}/users`, formData, {
          headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Error al guardar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{animation: 'slideUp 0.4s ease-out'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h1>API de Usuarios</h1>
          <p>Administra la información, roles y acceso de los usuarios del sistema.</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={18} className={loading ? "loading-spinner" : ""} /> Refrescar
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            <UserPlus size={18} /> Añadir Usuario
          </button>
        </div>
      </div>
      
      {error && <div className="badge badge-danger" style={{marginBottom: '16px', padding:'8px 16px'}}>{error}</div>}

      <div className="glass-panel" style={{padding: '0'}}>
        {loading && users.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center'}}><div className="loading-spinner"></div></div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td><span className="badge badge-info">#{user.id}</span></td>
                    <td style={{fontWeight: '500'}}>{user.name}</td>
                    <td><div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--text-secondary)'}}><Mail size={14}/> {user.email}</div></td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-warning' : 'badge-success'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                          className="btn btn-outline" 
                          style={{padding: '6px 10px', color: 'var(--accent-primary)', borderColor: 'transparent'}}
                          onClick={() => openEditModal(user)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{padding: '6px 10px', color: 'var(--danger)', borderColor: 'transparent'}}
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '24px'}}>No hay usuarios registrados en el sistema.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Añadir / Editar Usuario */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editUserId ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'}}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              {formError && (
                <div className="badge badge-danger" style={{width: '100%', marginBottom: '16px', padding: '8px 12px'}}>
                  {formError}
                </div>
              )}

              <div className="input-group">
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ej. Juan Pérez"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="juan@ejemplo.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Contraseña {editUserId && <span style={{fontSize: '0.75rem', textTransform: 'none', color: 'var(--text-secondary)'}}>(dejar en blanco para conservar)</span>}</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder={editUserId ? "••••••••" : "Contraseña de acceso"}
                  required={!editUserId}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Rol del Sistema</label>
                <select 
                  className="input-field"
                  style={{background: 'var(--bg-color)', color: 'white'}}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="user">USER (Cliente)</option>
                  <option value="ADMIN">ADMIN (Administrador)</option>
                </select>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
