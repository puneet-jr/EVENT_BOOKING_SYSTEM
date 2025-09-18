import db from '../db.js';
import bcrypt from 'bcryptjs';

export class AuthService {
  // 1. Create new user (hash password + insert into DB)
  static async createUser({ name, email, password, role = 'user' }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, role]
    );
    return { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), role };
  }

  // 2. Find user by email (returns hashed password)
  static async findUserByEmail(email) {
    const [rows] = await db.query(
      `SELECT id, name, email, password_hash, role FROM users WHERE email = ?`,
      [email.trim().toLowerCase()]
    );
    return rows[0];
  }

  // 3. Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 4. Update last login timestamp
  static async updateLastLogin(userId) {
    await db.query(
      `UPDATE users SET last_login = NOW() WHERE id = ?`,
      [userId]
    );
  }

  // 5. Get user profile (no sensitive info)
  static async getUserById(userId) {
    const [rows] = await db.query(
      `SELECT id, name, email, role, created_at, last_login FROM users WHERE id = ?`,
      [userId]
    );
    return rows[0];
  }
}
