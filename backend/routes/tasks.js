const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const prisma = require('../prismaClient');

/**
 * @swagger
 * tags:
 *   name: Tareas
 *   description: API de Gestión de Tareas
 */

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'pendiente',
        userId: req.user.id
      }
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const existing = await prisma.task.findFirst({ where: { id: parseInt(req.params.id), userId: req.user.id }});
    if (!existing) return res.status(404).json({ error: 'Tarea no encontrada' });

    const task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, status }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: parseInt(req.params.id), userId: req.user.id }});
    if (!existing) return res.status(404).json({ error: 'Tarea no encontrada' });

    await prisma.task.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
