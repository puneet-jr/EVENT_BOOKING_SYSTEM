import db from '../db.js';
import { sendEmail } from '../utils/emailUtils.js';

class BookingError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'BookingError';
    this.statusCode = statusCode;
  }
}

export class BookingService {
  static validateEventForBooking(event, alreadyBooked) {
    if (!event) throw new BookingError('Event not found or cancelled', 404);
    if (new Date(event.date) < new Date()) throw new BookingError('Cannot book past events', 400);
    if (alreadyBooked) throw new BookingError('You have already booked this event', 400);
    if (event.available_seats <= 0) throw new BookingError('Event is fully booked', 400);
  }

  static validateBookingForCancel(booking) {
    if (!booking) throw new BookingError('Booking not found or already cancelled', 404);
    if (new Date(booking.date) < new Date()) throw new BookingError('Cannot cancel past events', 400);
  }

  static async bookEvent(userId, eventId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Lock event and check details
      const [eventRows] = await connection.query(
        `SELECT id, title, date, available_seats, status,
                CASE WHEN b.id IS NOT NULL THEN 1 ELSE 0 END as already_booked
         FROM events e
         LEFT JOIN bookings b ON e.id = b.event_id 
           AND b.user_id = ? AND b.status = 'confirmed'
         WHERE e.id = ? AND e.status = 'active'
         FOR UPDATE`,
        [userId, eventId]
      );
      const event = eventRows[0];
      this.validateEventForBooking(event, event.already_booked);

      // Atomically reserve seat
      const [updateResult] = await connection.query(
        `UPDATE events SET available_seats = available_seats - 1 
         WHERE id = ? AND available_seats > 0`,
        [eventId]
      );
      if (updateResult.affectedRows === 0) {
        throw new BookingError('Event is fully booked', 400);
      }

      // Create booking
      const [result] = await connection.query(
        `INSERT INTO bookings (user_id, event_id, status, booking_date) 
         VALUES (?, ?, 'confirmed', NOW())`,
        [userId, eventId]
      );

      await connection.commit();
      return {
        id: result.insertId,
        userId,
        eventId,
        eventTitle: event.title,
        eventDate: event.date,
        status: 'confirmed',
        bookingDate: new Date()
      };
    } catch (error) {
      await connection.rollback();
      if (error instanceof BookingError) throw error;
      if (error.code === 'ER_DUP_ENTRY') throw new BookingError('You have already booked this event', 400);
      throw new BookingError('Booking failed', 500);
    } finally {
      connection.release();
    }
  }

  static async getUserBookings(userId, options = {}) {
    const { includeUpcoming = true, includePast = true, limit = 100 } = options;
    let whereClause = 'WHERE b.user_id = ? AND b.status = \'confirmed\'';
    const params = [userId];
    if (includeUpcoming && !includePast) {
      whereClause += ' AND e.date >= NOW()';
    } else if (!includeUpcoming && includePast) {
      whereClause += ' AND e.date < NOW()';
    }
    const [rows] = await db.query(
      `SELECT b.id, b.status, b.booking_date, 
              e.id as eventId, e.title as eventTitle, e.date as eventDate,
              e.available_seats as availableSeats
       FROM bookings b JOIN events e ON b.event_id = e.id
       ${whereClause} ORDER BY e.date ASC LIMIT ?`,
      [...params, limit]
    );
    return rows;
  }

  static async cancelBooking(bookingId, userId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [bookingRows] = await connection.query(
        `SELECT b.id, b.event_id, e.date, e.title, u.email, u.name 
         FROM bookings b 
         JOIN events e ON b.event_id = e.id 
         JOIN users u ON b.user_id = u.id 
         WHERE b.id = ? AND b.user_id = ? AND b.status = 'confirmed'
         FOR UPDATE`,
        [bookingId, userId]
      );
      const booking = bookingRows[0];
      this.validateBookingForCancel(booking);

      await connection.query(
        `UPDATE bookings SET status = 'cancelled', cancelled_date = NOW() 
         WHERE id = ? AND user_id = ?`,
        [bookingId, userId]
      );
      await connection.query(
        `UPDATE events SET available_seats = available_seats + 1 
         WHERE id = ?`,
        [booking.event_id]
      );

      // Send cancellation email simulation
      const subject = 'Booking Cancellation Confirmation';
      const text = `Dear ${booking.name}, your booking for the event "${booking.title}" has been cancelled.`;
      await sendEmail(booking.email, subject, text);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      if (error instanceof BookingError) throw error;
      throw new BookingError('Cancellation failed', 500);
    } finally {
      connection.release();
    }
  }

  static async getEventAvailability(eventId) {
    const [rows] = await db.query(
      `SELECT id, title, date, capacity, available_seats as availableSeats, status,
              (capacity - available_seats) as bookedSeats
       FROM events 
       WHERE id = ? AND status = 'active'`,
      [eventId]
    );
    return rows[0] || null;
  }
}