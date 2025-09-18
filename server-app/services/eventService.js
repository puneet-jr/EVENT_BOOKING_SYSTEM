import db from '../db.js';

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
    await db.query(
      `UPDATE events SET status = 'cancelled' WHERE id = ?`,
      [eventId]
    );
    return true;
  }

  // For admin dashboard
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