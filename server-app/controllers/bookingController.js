import asyncHandler from 'express-async-handler';
import { BookingService } from '../services/bookingService.js';
import { ValidationUtils } from '../utils/validation.js';

export const bookEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  const errors = ValidationUtils.validateBookingData({ eventId });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  try {
    const booking = await BookingService.bookEvent(userId, Number(eventId));
    res.status(201).json({ message: 'Booking successful', booking });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { upcoming, past, limit } = req.query;
  const options = {
    includeUpcoming: upcoming !== 'false',  
    includePast: past !== 'false',
    limit: limit ? Number(limit) : 50
  };

  const bookings = await BookingService.getUserBookings(userId, options);
  res.json({ bookings });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await BookingService.cancelBooking(Number(id), userId);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export const getEventAvailability = asyncHandler(async (req, res) => {
  const { eventId } = req.params;  // Fixed destructuring
  const availability = await BookingService.getEventAvailability(Number(eventId));

  if (!availability) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json({ availability });
});