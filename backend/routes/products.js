const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const prisma = require('../prismaClient');

/**
 * @swagger
 * tags:
 *   name: Tienda
 *   description: API de Productos, Categorías y Pedidos
 */

// --- CATEGORIAS ---
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.create({
      data: { name, description }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PRODUCTOS ---
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, inventory: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, categoryId, initialQuantity } = req.body;
    const product = await prisma.product.create({
      data: {
        name, description, price, categoryId,
        inventory: {
          create: { quantity: initialQuantity || 0 }
        }
      },
      include: { inventory: true }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PEDIDOS ---
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body; // array of { productId, quantity }
    let totalAmount = 0;
    const orderItemsData = [];

    // Validations and calculations
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId }});
      if (!product) return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      
      const inventory = await prisma.inventory.findUnique({ where: { productId: item.productId }});
      if (!inventory || inventory.quantity < item.quantity) {
        return res.status(400).json({ error: `Inventario insuficiente para ${product.name}` });
      }

      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Process order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      for (const item of items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }
      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PRODUCT UPDATE & DELETE ---
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, categoryId, quantity } = req.body;
    const productId = parseInt(req.params.id);
    
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        inventory: quantity !== undefined ? {
          upsert: {
            create: { quantity: parseInt(quantity) },
            update: { quantity: parseInt(quantity) }
          }
        } : undefined
      },
      include: { category: true, inventory: true }
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await prisma.product.delete({
      where: { id: productId }
    });
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
