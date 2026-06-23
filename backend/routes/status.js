const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * @swagger
 * tags:
 *   name: Monitoreo
 *   description: API de Estado y Monitoreo del Servidor
 */

router.get('/', async (req, res) => {
  const startTime = Date.now();
  let dbLatency = -1;
  let dbConnected = false;

  try {
    // Medir latencia de consulta a la base de datos
    await prisma.user.count();
    dbLatency = Date.now() - startTime;
    dbConnected = true;
  } catch (error) {
    console.error("Error de base de datos en health check:", error.message);
  }

  const memory = process.memoryUsage();

  res.json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    memory: {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
    },
    database: {
      connected: dbConnected,
      latencyMs: dbLatency
    }
  });
});

module.exports = router;
