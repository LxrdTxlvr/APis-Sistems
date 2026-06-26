import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Renderizador de Markdown ligero sin dependencias externas
function parseMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let keyCounter = 0;

  const parseInline = (line) => {
    const parts = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(<strong key={keyCounter++}>{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<em key={keyCounter++}>{match[3]}</em>);
      } else if (match[4]) {
        parts.push(
          <code key={keyCounter++} style={{
            background: 'rgba(255,255,255,0.12)',
            padding: '1px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.88em'
          }}>{match[4]}</code>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [line];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<br key={keyCounter++} />);
      continue;
    }

    // Lista con viñetas (- item o * item al inicio de línea)
    if (/^[\-\*]\s+/.test(line)) {
      elements.push(
        <div key={keyCounter++} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <span style={{ color: 'var(--accent-secondary)', flexShrink: 0 }}>•</span>
          <span>{parseInline(line.replace(/^[\-\*]\s+/, ''))}</span>
        </div>
      );
      continue;
    }

    // Lista numerada (1. item)
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={keyCounter++} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <span style={{ color: 'var(--accent-secondary)', flexShrink: 0, minWidth: '20px' }}>
            {numberedMatch[1]}.
          </span>
          <span>{parseInline(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Encabezados (# ## ###)
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = { 1: '1.3em', 2: '1.15em', 3: '1.05em' };
      elements.push(
        <div key={keyCounter++} style={{
          fontWeight: 'bold',
          fontSize: sizes[level] || '1em',
          marginTop: '12px',
          marginBottom: '4px',
          color: 'var(--accent-secondary)'
        }}>
          {parseInline(headingMatch[2])}
        </div>
      );
      continue;
    }

    // Línea normal con formato inline
    elements.push(
      <div key={keyCounter++} style={{ marginTop: '3px' }}>
        {parseInline(line)}
      </div>
    );
  }

  return elements;
}

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
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                  : 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
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
                lineHeight: 1.7
              }}>
                {msg.sender === 'bot' ? parseMarkdown(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
              <div style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', flexShrink: 0}}>
                <Bot size={20} color="white"/>
              </div>
              <div style={{padding: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                Escribiendo...
                <div className="loading-spinner" style={{width: '14px', height: '14px', borderWidth: '2px'}}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{
          padding: '20px',
          borderTop: '1px solid var(--panel-border)',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          gap: '12px'
        }}>
          <input
            type="text"
            className="input-field"
            style={{flex: 1, borderRadius: '24px', paddingLeft: '24px'}}
            placeholder="Escribe tu mensaje para Gemini..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{borderRadius: '24px', padding: '0 24px'}}
            disabled={loading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AI;
