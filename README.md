# Sistema de APIs con Dashboard Integrado (Rpo-APIs)

Este proyecto es un sistema integral compuesto por un **Backend de APIs robusto** y un **Dashboard (Frontend) premium** construido para interactuar y administrar diferentes módulos en tiempo real.

## 🚀 Características Principales

1. **API de Usuarios:** Gestión completa de usuarios (CRUD).
2. **API de Tareas:** Administración de tareas y sus respectivos estados.
3. **API de Tienda e Inventario:** Control de productos y funcionalidades de carrito de compras.
4. **API de Pagos:** Integración con la pasarela de pagos **Stripe** para procesamiento de transacciones.
5. **API de Inteligencia Artificial:** Integración con **Google Gemini** para un asistente virtual inteligente.
6. **API de Clima:** Integración con **OpenWeather** para datos meteorológicos.
7. **Monitoreo y Estado:** Dashboard de monitoreo en tiempo real del uso de memoria, CPU y latencia de la base de datos (Endpoint `/api/status`).

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React, Vite, CSS Vanilla (Diseño Premium, Glassmorphism, animaciones fluidas).
- **Backend:** Node.js, Express.js.
- **Base de Datos:** SQLite con ORM Prisma.
- **Seguridad:** JWT (JSON Web Tokens) para autenticación, Helmet para cabeceras HTTP, Express Rate Limit para protección DDoS.
- **Infraestructura:** Docker y Docker Compose para contenedores multiplataforma.

## ⚙️ Requisitos Previos

- Node.js (v18 o superior)
- npm (Node Package Manager)
- Docker y Docker Compose (Opcional, para despliegue en contenedores)

## 📦 Configuración e Instalación Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/LxrdTxlvr/APis-Sistems.git
   cd Rpo-APIs
   ```

2. **Variables de Entorno:**
   Crea un archivo `.env` en la carpeta `backend/` basándote en la siguiente estructura:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=3000
   JWT_SECRET="super-secret-jwt-key"
   OPENWEATHER_API_KEY="tu_api_key_de_openweathermap"
   GEMINI_API_KEY="tu_api_key_de_gemini"
   STRIPE_SECRET_KEY="tu_api_key_secreta_de_stripe"
   ```

3. **Instalación y ejecución manual:**
   
   *Backend:*
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

   *Frontend:*
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Ejecución con Docker Compose:**
   En la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up --build
   ```
   El dashboard estará disponible en `http://localhost:5173` y la API en `http://localhost:3000`.

---

## ☁️ Guía de Despliegue en la Nube

Este documento describe cómo desplegar el ecosistema de 7 APIs (Frontend y Backend) en proveedores de la nube modernos como **Render**, **Railway** o **AWS**.

### Opción A: Render (Recomendada por simplicidad y plan gratuito)
Render permite levantar el backend (Node.js) y el frontend (React/Vite) por separado de forma muy sencilla.

#### Despliegue del Backend:
1. Crea una cuenta en [Render](https://render.com/).
2. Conecta tu repositorio de GitHub.
3. Crea un nuevo **Web Service**:
   - **Language**: `Node`
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`
4. Configura un **Disk (Volumen de Persistencia)**:
   - Para que los datos guardados en SQLite (`dev.db`) no se borren en cada reinicio, ve a la sección **Disks** del Web Service de Render y añade un disco:
     - **Mount Path**: `/app/db`
     - **Size**: 1 GB
   - Actualiza tu variable de entorno `DATABASE_URL` a: `file:/app/db/dev.db`

#### Despliegue del Frontend:
1. Crea un nuevo **Static Site** en Render.
2. Configura los comandos de build:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
3. En la pestaña de configuración, añade reglas de redirección para que React Router funcione al refrescar la página:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

### Opción B: Docker Compose (Despliegue en VPS propio, ej. AWS EC2, DigitalOcean)
Si alquilas un servidor virtual (VPS), puedes correr todo con una sola línea de comandos utilizando el archivo `docker-compose.yml` provisto:

1. Instala Docker y Docker Compose en tu VPS.
2. Clona el repositorio en el servidor.
3. Inicia los contenedores en segundo plano:
   ```bash
   docker compose up -d --build
   ```
4. El frontend estará disponible en el puerto `5173` y el backend en el puerto `3000`.

### Escalabilidad (Migración de Base de Datos)
SQLite es excelente para desarrollo y aplicaciones pequeñas con volumen persistente. Si decides escalar tu aplicación en la nube para soportar múltiples instancias de servidor:
1. Cambia el proveedor de base de datos en `schema.prisma` de `"sqlite"` a `"postgresql"`.
2. Provee una base de datos PostgreSQL alojada en la nube (ej. Render PostgreSQL, Supabase o Neon).
3. Cambia la variable `DATABASE_URL` a la cadena de conexión de tu Postgres en la nube.
4. Corre `npx prisma db push` para mapear las tablas automáticamente en la nueva base de datos.

---

## 📚 Documentación de Endpoints (API Reference)

Base URL (Local): `http://localhost:3000`

Todas las peticiones protegidas deben incluir en los Headers:
`Authorization: Bearer <token_jwt>`

### 1. Autenticación (`/api/auth`)
**Login**
- **Ruta:** `POST /api/auth/login`
- **Descripción:** Autentica a un usuario y devuelve un token JWT.
- **Body:** `{ "email": "admin@empresa.com", "password": "password123" }`
- **Respuesta Exitosa (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUz...",
    "user": { "id": 1, "name": "Admin", "email": "admin@empresa.com" }
  }
  ```

### 2. Usuarios (`/api/users`) - Protegido
- **Obtener Usuarios:** `GET /api/users` (Devuelve arreglo de objetos de usuario sin contraseñas).
- **Crear Usuario:** `POST /api/users` (Body: `{ "name": "Juan", "email": "juan@correo.com", "password": "123", "role": "User" }`)
- **Eliminar Usuario:** `DELETE /api/users/:id`

### 3. Tareas (`/api/tasks`) - Protegido
- **Obtener Tareas:** `GET /api/tasks`
- **Crear Tarea:** `POST /api/tasks` (Body: `{ "title": "Nueva Tarea", "description": "Descripción", "status": "To Do" }`)
- **Actualizar Estado de Tarea:** `PUT /api/tasks/:id/status` (Body: `{ "status": "In Progress" }`)
- **Eliminar Tarea:** `DELETE /api/tasks/:id`

### 4. Tienda e Inventario (`/api/products`) - Protegido
- **Obtener Productos:** `GET /api/products`
- **Crear Producto:** `POST /api/products` (Body: `{ "name": "Producto", "description": "Desc", "price": 99.99, "stock": 10 }`)
- **Eliminar Producto:** `DELETE /api/products/:id`

### 5. Pagos con Stripe (`/api/payments`) - Protegido
- **Crear Intento de Pago:** `POST /api/payments/create-intent`
- **Body:** `{ "amount": 1500 }` *(El monto debe estar en la unidad menor de la moneda, ej. 1500 = $15.00)*
- **Respuesta (200 OK):** `{ "clientSecret": "pi_3Mtw..._secret_...", "transactionId": 1 }`

### 6. Asistente IA (`/api/ai`) - Protegido
- **Consultar a la IA:** `POST /api/ai/chat`
- **Body:** `{ "prompt": "¿Cuál es el estado de las ventas?" }`
- **Respuesta (200 OK):** `{ "response": "Respuesta generada por Gemini..." }`

### 7. Clima (`/api/weather`) - Protegido
- **Obtener Clima por Ciudad:** `GET /api/weather?city=Madrid` (Devuelve información meteorológica).

### 8. Monitoreo y Estado (`/api/status`)
- **Obtener Métricas del Servidor:** `GET /api/status`
- **Descripción:** Endpoint público (con rate limit) para obtener el consumo en tiempo real del servidor y latencia de DB.
- **Respuesta (200 OK):**
  ```json
  {
    "status": "up",
    "uptime": 3600.5,
    "memory": { "rss": "50.2 MB", "heapTotal": "30.1 MB", "heapUsed": "20.5 MB" },
    "dbLatency": 5,
    "timestamp": "2026-06-22T20:00:00.000Z"
  }
  ```
