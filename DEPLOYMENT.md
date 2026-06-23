# Guía de Despliegue en la Nube (Servidor en la Nube)

Este documento describe cómo desplegar el ecosistema de 7 APIs (Frontend y Backend) en proveedores de la nube modernos como **Render**, **Railway** o **AWS**.

---

## 1. Alternativas de Despliegue

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

---

### Opción B: Docker Compose (Despliegue en VPS propio, ej. AWS EC2, DigitalOcean)
Si alquilas un servidor virtual (VPS), puedes correr todo con una sola línea de comandos utilizando el archivo [docker-compose.yml](file:///c:/Users/ASUS/Downloads/NOVENO%20CUATRIMESTRE/DESARROLLO%20WEB%20INTEGRAL/Rpo-APIs/docker-compose.yml) provisto:

1. Instala Docker y Docker Compose en tu VPS.
2. Clona el repositorio en el servidor.
3. Inicia los contenedores en segundo plano:
   ```bash
   docker compose up -d --build
   ```
4. El frontend estará disponible en el puerto `5173` y el backend en el puerto `3000`.

---

## 2. Variables de Entorno Requeridas en la Nube

Asegúrate de configurar las siguientes variables de entorno en el panel de configuración de tu servicio en la nube (ej. Render o Railway Env Vars):

| Variable | Descripción | Valor Recomendado |
| --- | --- | --- |
| `PORT` | Puerto de escucha | `3000` |
| `DATABASE_URL` | Ruta del archivo de base de datos | `file:/app/db/dev.db` (Con volumen montado) |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | Una cadena segura aleatoria |
| `OPENWEATHER_API_KEY` | Clave API de OpenWeatherMap | Tu API Key real |
| `GEMINI_API_KEY` | Clave API de Google Gemini | Tu API Key real (ej. Gemini 2.5) |
| `STRIPE_SECRET_KEY` | Clave Secreta de Stripe de pruebas | Tu clave secreta `sk_test_...` |

---

## 3. Escalabilidad (Migración de Base de Datos)
SQLite es excelente para desarrollo y aplicaciones pequeñas con volumen persistente. Si decides escalar tu aplicación en la nube para soportar múltiples instancias de servidor (donde no puedes compartir un disco local de forma eficiente):

1. Cambia el proveedor de base de datos en [schema.prisma](file:///c:/Users/ASUS/Downloads/NOVENO%20CUATRIMESTRE/DESARROLLO%20WEB%20INTEGRAL/Rpo-APIs/backend/prisma/schema.prisma) de `"sqlite"` a `"postgresql"`.
2. Provee una base de datos PostgreSQL alojada en la nube (ej. Render PostgreSQL, Supabase o Neon).
3. Cambia la variable `DATABASE_URL` a la cadena de conexión de tu Postgres en la nube (ej. `postgresql://user:pass@host:5432/dbname`).
4. Corre `npx prisma db push` para mapear las tablas automáticamente en la nueva base de datos.
