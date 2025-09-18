import express from 'express';
import { createEvent, getAllEvents, getEventById, cancelEvent, getAdminEvents } from '../controllers/eventsController.js';
import { verifyToken } from '../middleware/tokenValidation.js';
import { requireRole } from '../middleware/tokenValidation.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin-only routes
router.post('/', verifyToken, requireRole(['admin']), createEvent);
router.delete('/:id/cancel', verifyToken, requireRole(['admin']), cancelEvent);
router.get('/admin/dashboard', verifyToken, requireRole(['admin']), getAdminEvents);

export default router;