# Event Booking System

A full-stack web application for managing and booking events. This repository contains the backend API built with Node.js, Express, and MySQL.

## Features

- **User Authentication**: Signup, login, and profile management with JWT tokens.
- **Role-Based Access Control**: Support for 'user' and 'admin' roles with protected routes.
- **Event Management**: Admins can create, view, and cancel events.
- **Booking System**: Users can book events, view their bookings, cancel bookings, and check event availability.
- **Email Notifications**: Simulated email notifications for booking confirmations and cancellations using Nodemailer with Ethereal.
- **Database Integration**: MySQL database for storing users, events, and bookings.
- **Validation**: Input validation for all endpoints.
- **Error Handling**: Comprehensive error handling with custom error classes.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer (with Ethereal for testing)
- **Validation**: Custom validation utilities
- **Development**: Nodemon for hot reloading

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd EVENT_BOOKING_SYSTEM/server-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables by copying `.env` and updating the values:
   ```bash
   cp .env.example .env  # If you have an example file, otherwise create .env
   ```
   Update the following in `.env`:
   ```
   PORT=5001
   DB_HOST=localhost  # Your MySQL host
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=event_management
   JWT_SECRET=your_jwt_secret_key
   ```

4. Set up the MySQL database:
   - Create a database named `event_management`.
   - Run the SQL scripts to create tables (users, events, bookings). Example schema:
     ```sql
     CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       last_login TIMESTAMP NULL
     );

     CREATE TABLE events (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       description TEXT,
       date DATETIME NOT NULL,
       capacity INT NOT NULL,
       available_seats INT DEFAULT 0,
       status ENUM('active', 'cancelled') DEFAULT 'active',
       created_by INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (created_by) REFERENCES users(id)
     );

     CREATE TABLE bookings (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL,
       event_id INT NOT NULL,
       status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
       booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       cancelled_date TIMESTAMP NULL,
       FOREIGN KEY (user_id) REFERENCES users(id),
       FOREIGN KEY (event_id) REFERENCES events(id),
       UNIQUE KEY unique_booking (user_id, event_id, status)
     );
     ```
   - Note: Ensure `available_seats` is initialized to `capacity` when creating events (update in service if needed).

5. Create an admin user (optional, for testing):
   ```bash
   node admin.js
   ```
   This creates an admin user with email `admin@example.com` and password `admin123`.

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5001` (or the port specified in `.env`).

2. Test the API using tools like Postman or curl. Refer to `API.txt` for detailed endpoint documentation and sample requests.

## API Documentation

Detailed API endpoints, including authentication, event management, and booking operations, are documented in `API.txt`. Key endpoints include:

- **Auth**: `/auth/signup`, `/auth/login`, `/auth/profile`
- **Events**: `/events` (GET, POST), `/events/:id`, `/events/:id/cancel`, `/events/admin/dashboard`
- **Bookings**: `/bookings` (POST, GET), `/bookings/:id` (DELETE), `/bookings/events/:eventId/availability`

All booking and admin routes require JWT authentication.

## Project Structure

```
server-app/
├── controllers/          # Request handlers (authController.js, eventsController.js, bookingController.js)
├── services/             # Business logic (authService.js, eventService.js, bookingService.js)
├── routes/               # Route definitions (authRoutes.js, eventRoutes.js, bookingRoutes.js)
├── middleware/           # Middleware (tokenValidation.js)
├── utils/                # Utilities (validation.js, tokenUtils.js, emailUtils.js)
├── db.js                 # Database connection
├── index.js              # Main server file
├── admin.js              # Script to create admin user
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── API.txt               # API documentation
└── .gitignore            # Git ignore file
```

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test thoroughly.
4. Submit a pull request.

