const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configurar Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: { error: 'Demasiadas peticiones desde esta IP. Por favor, intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Desactivado para no interferir con swagger en local
}));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/api', limiter);

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de 7 APIs',
      version: '1.0.0',
      description: 'Documentación de APIs para Usuarios, Tareas, Productos, Autenticación, Pagos, Clima e IA',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta Básica
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido al Sistema de 7 APIs' });
});

// Importación y uso de rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/products', require('./routes/products'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/status', require('./routes/status'));

// Función de Sembrado (Seeding) de Base de Datos
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("Iniciando sembrado de la base de datos (seeding)...");
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await prisma.user.create({
        data: {
          name: 'Oliver Admin',
          email: 'admin@devcorner.com',
          password: hashedPassword,
          role: 'ADMIN',
        }
      });
      console.log(`Usuario administrador creado con ID: ${admin.id}`);

      // Crear categorías por defecto
      const catElectronica = await prisma.category.create({ data: { name: 'Electrónica', description: 'Dispositivos electrónicos de alta tecnología' } });
      const catAccesorios = await prisma.category.create({ data: { name: 'Accesorios', description: 'Complementos y accesorios para tus gadgets' } });
      const catHogar = await prisma.category.create({ data: { name: 'Hogar', description: 'Artículos para automatización y confort en el hogar' } });
      
      console.log("Categorías creadas.");

      // Crear productos por defecto
      await prisma.product.create({
        data: {
          name: 'Laptop Pro X',
          description: 'Computadora de alto rendimiento para desarrolladores',
          price: 1200.50,
          categoryId: catElectronica.id,
          inventory: { create: { quantity: 15 } }
        }
      });

      await prisma.product.create({
        data: {
          name: 'Auriculares Inalámbricos',
          description: 'Cancelación de ruido activa y sonido de alta fidelidad',
          price: 199.99,
          categoryId: catAccesorios.id,
          inventory: { create: { quantity: 42 } }
        }
      });

      await prisma.product.create({
        data: {
          name: 'Monitor 4K UltraWide',
          description: 'Monitor curvo de 34 pulgadas con excelente gama de colores',
          price: 450.00,
          categoryId: catElectronica.id,
          inventory: { create: { quantity: 8 } }
        }
      });

      await prisma.product.create({
        data: {
          name: 'Teclado Mecánico RGB',
          description: 'Switches mecánicos táctiles con retroiluminación configurable',
          price: 120.00,
          categoryId: catAccesorios.id,
          inventory: { create: { quantity: 25 } }
        }
      });

      console.log("Productos iniciales creados.");
      console.log("Sembrado completado exitosamente.");
    }
  } catch (error) {
    console.error("Error durante el seeding de la base de datos:", error.message);
  }
}

// Manejador Global de Errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '¡Algo salió mal!', message: err.message });
});

app.listen(port, async () => {
  await seedDatabase();
  console.log(`Servidor corriendo en el puerto ${port}`);
  console.log(`Documentación de Swagger disponible en http://localhost:${port}/api-docs`);
});
