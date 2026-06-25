import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Payments() {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('orderId');
    if (id) {
      setOrderId(id);
    }
  }, []);

  const handleProcessPayment = async () => {
    if (!orderId) return;
    setStatus('loading');
    try {
      const res = await axios.post(`${API_URL}/payments/process`, { orderId }, {
        headers: { Authorization: `Bearer mock-token` }
      }).catch(e => {
        if(e.response) throw new Error(e.response.data.error || 'Error procesando pago');
        throw e;
      });
      
      setStatus('success');
      setMessage(res.data.message || 'El pago ha sido aprobado exitosamente.');
      if(res.data.url) {
        // Redirigir a stripe
        window.location.href = res.data.url;
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="glass-panel" style={{animation: 'slideUp 0.4s ease-out'}}>
      <h1>Terminal de Pagos (Stripe)</h1>
      <p>Introduce un ID de Pedido para simular un Checkout o conectarse a la API de Stripe.</p>
      
      <div style={{marginTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
        
        <div className="glass-panel" style={{flex: '1 1 400px'}}>
          <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px'}}>
            <div style={{background: 'rgba(99,102,241,0.2)', padding: '12px', borderRadius: '12px'}}>
              <CreditCard size={24} color="var(--accent-primary)" />
            </div>
            <h3>Pagar Pedido</h3>
          </div>
          
          <div className="input-group">
            <label>ID del Pedido</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ej. 1" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{width: '100%', marginTop: '16px', height: '48px'}}
            onClick={handleProcessPayment}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <div className="loading-spinner"></div> : 'Procesar Transacción'}
          </button>
        </div>

        {status && status !== 'loading' && (
          <div className="glass-panel" style={{flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: `1px solid ${status === 'success' ? 'var(--success)' : 'var(--danger)'}`}}>
            {status === 'success' ? (
              <ShieldCheck size={64} color="var(--success)" style={{marginBottom: '16px'}} />
            ) : (
              <AlertCircle size={64} color="var(--danger)" style={{marginBottom: '16px'}} />
            )}
            <h3 style={{color: status === 'success' ? 'var(--success)' : 'var(--danger)'}}>
              {status === 'success' ? 'Pago Exitoso' : 'Transacción Rechazada'}
            </h3>
            <p style={{marginTop: '8px'}}>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;
