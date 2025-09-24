import db from '../db.js';
import { sendEmail } from '../utils/emailUtils.js';

export class EventService {
  static async createEvent({ title, date, capacity, description, createdBy }) {
    const [result] = await db.query(
      `INSERT INTO events (title, description, date, capacity, status, created_by, created_at) 
       VALUES (?, ?, ?, ?, 'active', ?, NOW())`,
      [title.trim(), description?.trim() || null, date, capacity, createdBy]
    );
    
    return {
      id: result.insertId,
      title: title.trim(),
      description: description?.trim() || null,
      date,
      capacity,
      status: 'active',
      createdBy
    };
  }

  static async getAllEvents() {
    const [rows] = await db.query(
      `SELECT id, title, description, date, capacity, status, created_at 
       FROM events 
       WHERE status = 'active' AND date > NOW()
       ORDER BY date ASC`
    );
    return rows;
  }
  
  static async getEventById(eventId) {
    const [rows] = await db.query(
      `SELECT id, title, description, date, capacity, status, created_at, created_by
       FROM events 
       WHERE id = ?`,
      [eventId]
    );
    return rows[0];
  }
  
  static async cancelEvent(eventId) {
    // Cancel the event
    await db.query(
      `UPDATE events SET status = 'cancelled' WHERE id = ?`,
      [eventId]
    );

    // Fetch booked users
    const [bookings] = await db.query(
      `SELECT u.email, u.name, e.title 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       JOIN events e ON b.event_id = e.id 
       WHERE b.event_id = ? AND b.status = 'confirmed'`,
      [eventId]
    );

    // Update bookings to cancelled
    await db.query(
      `UPDATE bookings SET status = 'cancelled', cancelled_date = NOW() 
       WHERE event_id = ? AND status = 'confirmed'`,
      [eventId]
    );

    // Send cancellation email simulation to all booked users
    const subject = 'Event Cancellation Notice';
    for (const booking of bookings) {
      const text = `Dear ${booking.name}, your booking for the event "${booking.title}" has been cancelled due to event cancellation.`;
      await sendEmail(booking.email, subject, text);
    }

    return true;
  }

  static async getEventsByAdmin(adminId) {
    const [rows] = await db.query(
      `SELECT id, title, description, date, capacity, status, created_at 
       FROM events 
       WHERE created_by = ?
       ORDER BY date ASC`,
      [adminId]
    );
    return rows;
  }
}