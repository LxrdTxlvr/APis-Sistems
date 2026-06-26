const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Limpiar la URL de comillas y espacios extra (error común al configurar variables en Render)
const rawUrl = process.env.DATABASE_URL || '';
const DATABASE_URL = rawUrl.trim().replace(/^["']|["']$/g, '');

if (DATABASE_URL) {
  try {
    const url = new URL(DATABASE_URL);
    console.log(`[Database] Intentando conectar al host: ${url.host}, base de datos: ${url.pathname}`);
  } catch (e) {
    console.log(`[Database] DATABASE_URL no es una URL válida. Valor recibido (longitud ${DATABASE_URL.length}): "${DATABASE_URL.substring(0, 30)}..."`);
  }
} else {
  console.log('[Database] DATABASE_URL no está definida en las variables de entorno');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL && !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1')
    ? { rejectUnauthorized: false }
    : false
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;


