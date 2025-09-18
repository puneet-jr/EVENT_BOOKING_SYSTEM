import asyncHandler from 'express-async-handler';
import { EventService } from '../services/eventService.js';
import { ValidationUtils } from '../utils/validation.js';

export const createEvent = asyncHandler(async (req, res) => {
  const { title, date, capacity, description } = req.body;
  
  // Validate input
  const errors = ValidationUtils.validateEventData({ title, date, capacity });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const createdBy = req.user.id;

  try {
    const event = await EventService.createEvent({
      title,
      date: new Date(date),
      capacity: Number(capacity),
      description,
      createdBy
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event: ", error);
    throw error;
  }
});

export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await EventService.getAllEvents();
  res.json({ events });
});

export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await EventService.getEventById(id);

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json({ event });
});

export const cancelEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await EventService.getEventById(id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check if the admin is the one who created the event
  if (event.created_by !== req.user.id && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'You can only cancel events you created' });
  }
  
  await EventService.cancelEvent(id);
  res.json({ message: 'Event cancelled successfully' });
});

export const getAdminEvents = asyncHandler(async (req, res) => {
  const events = await EventService.getEventsByAdmin(req.user.id);
  res.json({ events });
});