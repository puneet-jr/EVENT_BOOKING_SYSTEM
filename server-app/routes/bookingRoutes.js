import express from 'express';
import { bookEvent, getUserBookings, cancelBooking, getEventAvailability } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/tokenValidation.js';

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

router.post('/', bookEvent);
router.get('/', getUserBookings);
router.delete('/:id', cancelBooking);
router.get('/events/:eventId/availability', getEventAvailability);

export default router;