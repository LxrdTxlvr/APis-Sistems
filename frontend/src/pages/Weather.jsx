import React, { useState } from 'react';
import axios from 'axios';
import { Cloud, Search, Wind, Droplets, MapPin, Sun, CloudRain } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (e) => {
    e?.preventDefault();
    const target = city || 'Ciudad de Mexico';
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/weather?city=${target}`);
      setWeather(res.data);
    } catch (err) {
      setWeather({ city: target, condition: 'Error', temperature: '--', humidity: '--', windSpeed: '--' });
    } finally {
      setLoading(false);
    }
  };

  const getConditionIcon = (condition) => {
    const c = condition.toLowerCase();
    if(c.includes('soleado') || c.includes('despejado') || c.includes('clear')) return <Sun size={64} color="#fcd34d" />;
    if(c.includes('lluvia') || c.includes('rain')) return <CloudRain size={64} color="#60a5fa" />;
    return <Cloud size={64} color="#e2e8f0" />;
  };

  return (
    <div className="glass-panel" style={{animation: 'slideUp 0.4s ease-out'}}>
      <h1>API Meteorológica</h1>
      <p>Conexión a OpenWeatherMap para consultar climas en tiempo real.</p>
      
      <form onSubmit={fetchWeather} style={{marginTop: '24px', display: 'flex', gap: '12px'}}>
        <div className="input-group" style={{flex: 1, margin: 0}}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar ciudad (ej. Monterrey, Tokyo...)" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <div className="loading-spinner"></div> : <><Search size={18}/> Consultar</>}
        </button>
      </form>

      {weather && (
        <div className="glass-panel" style={{marginTop: '32px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(30, 64, 175, 0.4))', border: '1px solid rgba(96, 165, 250, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px'}}>
          <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
            {getConditionIcon(weather.condition)}
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', marginBottom: '8px'}}>
                <MapPin size={16}/> <span style={{textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600'}}>{weather.city}</span>
              </div>
              <div style={{fontSize: '3.5rem', fontWeight: 'bold', lineHeight: 1, textShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
                {weather.temperature}
              </div>
              <div style={{fontSize: '1.2rem', textTransform: 'capitalize', marginTop: '8px', color: '#e0e7ff'}}>
                {weather.condition}
              </div>
            </div>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '150px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{display: 'flex', gap: '8px', color: '#93c5fd'}}><Droplets size={18}/> Humedad</span>
              <strong>{weather.humidity}</strong>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{display: 'flex', gap: '8px', color: '#93c5fd'}}><Wind size={18}/> Viento</span>
              <strong>{weather.windSpeed}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather;
