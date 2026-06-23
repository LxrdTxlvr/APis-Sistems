const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const prisma = require('../prismaClient');

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: API de Pagos (Integración con Stripe)
 */

router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await prisma.order.findUnique({ 
      where: { id: parseInt(orderId) },
      include: { items: { include: { product: true } } }
    });
    
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    
    if (order.status !== 'pending' && order.status !== 'pendiente') {
      return res.status(400).json({ error: `El pedido ya está en estado ${order.status}` });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (stripeKey && stripeKey !== "sk_test_tu_api_key_de_stripe") {
      const stripe = require('stripe')(stripeKey);
      
      const lineItems = order.items.map(item => ({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: item.product.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `http://localhost:5173/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5173/payments/cancel`,
      });

      return res.json({ 
        message: 'Sesión de Stripe Checkout creada', 
        sessionId: session.id, 
        url: session.url 
      });
    }

    // --- FALLBACK SIMULADOR ---
    await new Promise(resolve => setTimeout(resolve, 1500));
    const isSuccess = Math.random() > 0.1; 

    if (!isSuccess) {
      return res.status(400).json({ error: 'El pago falló por fondos insuficientes o rechazo del banco.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'pagado' }
    });

    res.json({ 
      message: 'Pago procesado exitosamente (Simulado)', 
      transactionId: `txn_${Date.now()}`, 
      order: updatedOrder,
      note: "Usando simulador porque la clave de Stripe no está configurada."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
