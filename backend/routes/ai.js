const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const prisma = require('../prismaClient');

/**
 * @swagger
 * tags:
 *   name: IA
 *   description: API de IA Chat (Gemini)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'El texto del prompt es requerido' });

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "tu_api_key_de_gemini") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const answer = result.response.text();
      
      return res.json({
        prompt,
        answer,
        model: "gemini-1.5-flash"
      });
    } catch (error) {
      console.error("Error API Gemini:", error.message);
      // Fallback a simulador en caso de error
    }
  }

  // Simulador Inteligente (Fallback basado en Base de Datos)
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerPrompt = prompt.toLowerCase();
  let answer = "";

  try {
    if (lowerPrompt.includes('usuario')) {
      const users = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
      answer = `Actualmente hay ${users.length} usuarios registrados en la base de datos:\n` + 
        users.map(u => `- ${u.name} (${u.email}) - Rol: ${u.role}`).join('\n');
    } else if (lowerPrompt.includes('tarea') || lowerPrompt.includes('pendiente')) {
      const tasks = await prisma.task.findMany();
      const pending = tasks.filter(t => t.status === 'pendiente' || t.status === 'pending');
      const inProgress = tasks.filter(t => t.status === 'en_progreso' || t.status === 'in-progress' || t.status === 'en progreso');
      const completed = tasks.filter(t => t.status === 'completada' || t.status === 'completed');
      
      answer = `Hay un total de ${tasks.length} tareas registradas en el sistema:\n` +
        `- 📝 Pendientes: ${pending.length}\n` +
        `- ⏳ En Progreso: ${inProgress.length}\n` +
        `- ✅ Completadas: ${completed.length}\n\n` +
        `Listado de tareas:\n` +
        tasks.map(t => `- [${t.status}] ${t.title}`).join('\n');
    } else if (lowerPrompt.includes('producto') || lowerPrompt.includes('tienda') || lowerPrompt.includes('inventario') || lowerPrompt.includes('stock')) {
      const products = await prisma.product.findMany({ include: { inventory: true, category: true } });
      answer = `El catálogo actual cuenta con ${products.length} productos en la tienda:\n` +
        products.map(p => `- 📦 ${p.name} ($${p.price}) - Categoría: ${p.category.name} - Stock: ${p.inventory?.quantity || 0}`).join('\n');
    } else if (lowerPrompt.includes('pedido') || lowerPrompt.includes('pago') || lowerPrompt.includes('venta') || lowerPrompt.includes('transaccion')) {
      const orders = await prisma.order.findMany();
      const paidOrders = orders.filter(o => o.status === 'pagado' || o.status === 'paid');
      const pendingOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'pending');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      answer = `Historial de transacciones y pedidos:\n` +
        `- Pedidos totales: ${orders.length}\n` +
        `- Pedidos pagados: ${paidOrders.length}\n` +
        `- Pedidos pendientes de pago: ${pendingOrders.length}\n` +
        `- Ingresos totales (simulados/reales): $${totalRevenue.toFixed(2)}`;
    } else {
      const responses = [
        "Esa es una pregunta muy interesante. Si deseas consultar información del sistema, prueba preguntándome sobre 'usuarios', 'tareas', 'productos' o 'pedidos'.",
        "Entiendo lo que preguntas. Para este proyecto, puedes gestionar usuarios, tareas e inventarios en tiempo real.",
        "Déjame pensar en eso... Como tu asistente, te sugiero que explores las diferentes APIs del menú lateral para ver cómo interactúan con la base de datos.",
        "¡Por supuesto! Puedo decirte cuántos productos, tareas o usuarios hay en el sistema en tiempo real si me lo preguntas.",
        "Actualmente el sistema está funcionando al 100% sobre una base de datos SQLite persistente con Prisma."
      ];
      answer = responses[Math.floor(Math.random() * responses.length)];
    }
  } catch (error) {
    console.error("Error en simulador de IA:", error);
    answer = "Lo siento, hubo un problema al consultar la base de datos del sistema para responder tu pregunta.";
  }

  res.json({
    prompt,
    answer,
    model: "simulated-ai-v2",
    note: "Usando respuestas simuladas basadas en base de datos porque la API Key de Gemini falta o es inválida."
  });
});

module.exports = router;
