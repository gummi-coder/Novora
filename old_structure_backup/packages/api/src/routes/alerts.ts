import express, { Request } from 'express';
import { Op } from 'sequelize';
import Alert from '../models/Alert';
import { authenticateToken } from '../middleware/auth';
import sequelize from '../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
  };
}

const router = express.Router();

// Get all alerts with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      search,
      startDate,
      endDate,
    } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } },
        { source: { [Op.like]: `%${search}%` } },
      ];
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const { count, rows } = await Alert.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      alerts: rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get alert by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// Create new alert
router.post('/', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create alert' });
  }
});

// Update alert
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    await alert.update(req.body);
    res.json(alert);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update alert' });
  }
});

// Delete alert
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    await alert.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Acknowledge alert
router.post('/:id/acknowledge', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    await alert.update({
      status: 'acknowledged',
      acknowledgedAt: new Date(),
      acknowledgedBy: req.user?.email,
    });
    res.json(alert);
  } catch (error) {
    res.status(400).json({ error: 'Failed to acknowledge alert' });
  }
});

// Resolve alert
router.post('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    await alert.update({
      status: 'resolved',
      resolvedAt: new Date(),
    });
    res.json(alert);
  } catch (error) {
    res.status(400).json({ error: 'Failed to resolve alert' });
  }
});

// Get alert statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalAlerts = await Alert.count();
    const activeAlerts = await Alert.count({ where: { status: 'active' } });
    const resolvedAlerts = await Alert.count({ where: { status: 'resolved' } });
    const acknowledgedAlerts = await Alert.count({ where: { status: 'acknowledged' } });

    const alertsByType = await Alert.findAll({
      attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['type'],
    });

    const alertsByPriority = await Alert.findAll({
      attributes: ['priority', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['priority'],
    });

    res.json({
      total: totalAlerts,
      active: activeAlerts,
      resolved: resolvedAlerts,
      acknowledged: acknowledgedAlerts,
      byType: alertsByType,
      byPriority: alertsByPriority,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

export default router; 