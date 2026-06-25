import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Plus, Clock, CheckCircle, Trash2, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const MOCK_TOKEN = 'mock-token';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/tasks`, { 
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar tareas de la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/tasks`, { 
        title: newTask,
        status: 'pendiente'
      }, {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      setTasks(prev => [...prev, res.data]);
      setNewTask('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al agregar tarea');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      const res = await axios.put(`${API_URL}/tasks/${taskId}`, {
        title: taskToUpdate.title,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al cambiar estado de la tarea');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${MOCK_TOKEN}` }
      });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al eliminar tarea');
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'completada') return <CheckCircle size={18} color="var(--success)" />;
    if (status === 'en_progreso') return <Clock size={18} color="var(--warning)" />;
    return <CheckSquare size={18} color="var(--text-secondary)" />;
  };

  return (
    <div className="glass-panel" style={{animation: 'slideUp 0.4s ease-out'}}>
      <h1>API de Tareas</h1>
      <p>Organiza tu día a día gestionando tus pendientes interactuando con la base de datos.</p>
      
      {error && <div className="badge badge-danger" style={{marginTop: '16px', padding:'8px 16px', display: 'block'}}>{error}</div>}

      <div className="glass-panel" style={{marginTop: '24px', background: 'rgba(99, 102, 241, 0.05)'}}>
        <form onSubmit={handleAddTask} style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          <div className="input-group" style={{margin: 0, flex: 1}}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="¿Qué necesitas hacer hoy?" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{height: '46px'}}>
            <Plus size={20} /> Añadir
          </button>
        </form>
      </div>

      <div className="grid-cards" style={{marginTop: '32px'}}>
        {['pendiente', 'en_progreso', 'completada'].map(columnStatus => (
          <div key={columnStatus} className="glass-panel" style={{padding: '16px'}}>
            <h3 style={{textTransform: 'capitalize', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>{columnStatus.replace('_', ' ')}</span>
              <span className="badge badge-info" style={{fontSize: '0.75rem', padding: '2px 8px'}}>
                {tasks.filter(t => t.status === columnStatus).length}
              </span>
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {tasks.filter(t => t.status === columnStatus).map(task => (
                <div key={task.id} className="glass-panel" style={{padding: '16px', background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                    <div style={{marginTop: '2px'}}>{getStatusIcon(task.status)}</div>
                    <div style={{fontSize: '0.95rem', flex: 1, wordBreak: 'break-word', color: task.status === 'completada' ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.status === 'completada' ? 'line-through' : 'none'}}>{task.title}</div>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px'}}>
                    
                    {columnStatus === 'en_progreso' && (
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '4px 8px', fontSize: '0.75rem', borderColor: 'transparent'}}
                        title="Regresar a Pendiente"
                        onClick={() => handleUpdateStatus(task.id, 'pendiente')}
                      >
                        <ArrowLeft size={14} />
                      </button>
                    )}

                    {columnStatus === 'completada' && (
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '4px 8px', fontSize: '0.75rem', borderColor: 'transparent'}}
                        title="Regresar a En Progreso"
                        onClick={() => handleUpdateStatus(task.id, 'en_progreso')}
                      >
                        <ArrowLeft size={14} />
                      </button>
                    )}

                    {columnStatus === 'pendiente' && (
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '4px 8px', fontSize: '0.75rem', borderColor: 'transparent', color: 'var(--warning)'}}
                        title="Iniciar tarea"
                        onClick={() => handleUpdateStatus(task.id, 'en_progreso')}
                      >
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {columnStatus === 'en_progreso' && (
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '4px 8px', fontSize: '0.75rem', borderColor: 'transparent', color: 'var(--success)'}}
                        title="Completar tarea"
                        onClick={() => handleUpdateStatus(task.id, 'completada')}
                      >
                        <Check size={14} />
                      </button>
                    )}

                    <button 
                      className="btn btn-outline" 
                      style={{padding: '4px 8px', fontSize: '0.75rem', borderColor: 'transparent', color: 'var(--danger)'}}
                      title="Eliminar tarea"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === columnStatus).length === 0 && (
                <p style={{textAlign: 'center', fontSize: '0.85rem', opacity: 0.5, padding: '16px 0'}}>No hay tareas aquí</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
