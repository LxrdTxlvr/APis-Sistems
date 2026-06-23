import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

function AI() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! Soy Gemini 1.5, tu asistente inteligente. ¿En qué puedo ayudarte con este proyecto?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/ai/chat`, { prompt: userMsg });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Hubo un error de conexión con la API de IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{height: '100%', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.4s ease-out'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
        <Sparkles size={28} color="var(--accent-secondary)" />
        <div>
          <h1 style={{margin: 0}}>Asistente IA (Gemini)</h1>
          <p style={{marginTop: '4px'}}>Interactúa con el modelo de lenguaje de Google.</p>
        </div>
      </div>
      
      <div className="glass-panel" style={{flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden'}}>
        
        {/* Historial de Chat */}
        <div style={{flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex', 
              gap: '12px', 
              alignItems: 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.sender === 'user' ? <User size={20} color="white"/> : <Bot size={20} color="white"/>}
              </div>
              <div style={{
                background: msg.sender === 'user' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.sender === 'user' ? 'rgba(99, 102, 241, 0.3)' : 'var(--panel-border)'}`,
                padding: '16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                maxWidth: '75%',
                lineHeight: 1.6
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%'}}>
                <Bot size={20} color="white"/>
              </div>
              <div style={{padding: '16px'}}>Escribiendo... <div className="loading-spinner" style={{width: '14px', height: '14px', borderWidth: '2px', marginLeft: '8px'}}></div></div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{padding: '20px', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '12px'}}>
          <input 
            type="text" 
            className="input-field" 
            style={{flex: 1, borderRadius: '24px', paddingLeft: '24px'}} 
            placeholder="Escribe tu mensaje para Gemini..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{borderRadius: '24px', padding: '0 24px'}} disabled={loading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AI;
