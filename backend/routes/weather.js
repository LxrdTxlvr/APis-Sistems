const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * tags:
 *   name: Clima
 *   description: API de Clima (OpenWeatherMap)
 */

router.get('/', async (req, res) => {
  const { city } = req.query;
  const targetCity = city || 'Ciudad de Mexico';
  
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey && apiKey !== "tu_api_key_de_openweathermap") {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${targetCity}&appid=${apiKey}&units=metric&lang=es`);
      const data = response.data;
      
      return res.json({
        city: data.name,
        condition: data.weather[0].description,
        temperature: `${Math.round(data.main.temp)}°C`,
        humidity: `${data.main.humidity}%`,
        windSpeed: `${data.wind.speed} m/s`
      });
    } catch (error) {
      console.error("Error API OpenWeather:", error.message);
      // Fallback a simulador en caso de error
    }
  }

  // Datos de clima simulados (Fallback)
  const weatherConditions = ['Soleado', 'Nublado', 'Lluvioso', 'Tormenta', 'Nevado'];
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  const temperature = Math.floor(Math.random() * 20) + 10; // 10 a 30 C en México

  res.json({
    city: targetCity,
    condition,
    temperature: `${temperature}°C`,
    humidity: `${Math.floor(Math.random() * 50) + 30}%`,
    windSpeed: `${Math.floor(Math.random() * 20)} km/h`,
    note: "Usando datos simulados porque la API Key de OpenWeather falta o es inválida."
  });
});

module.exports = router;
