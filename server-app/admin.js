import db from '../db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdminUser() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await db.query(
      `INSERT INTO users (name, email, password_hash, role, created_at) 
       VALUES (?, ?, ?, 'admin', NOW())`,
      ['Admin User', 'admin@example.com', passwordHash]
    );
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();