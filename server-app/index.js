import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
// These routes don't exist yet, so comment them until created
// import eventRoutes from './routes/eventRoutes.js';
// import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
// app.use('/events', eventRoutes);
// app.use('/bookings', bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});