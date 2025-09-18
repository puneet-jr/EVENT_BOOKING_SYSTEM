export const ValidationUtils = {
  // Auth validations
  validateSignupData: ({ name, email, password }) => {
    const errors = [];
    if (!name?.trim()) errors.push('Name is required');
    if (!email?.trim()) errors.push('Email is required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
    
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.trim())) {
      errors.push('Invalid email format');
    }
    
    return errors;
  },
  
  validateLoginData: ({ email, password }) => {
    const errors = [];
    if (!email?.trim()) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    return errors;
  },
  
  // Event validations
  validateEventData: ({ title, date, capacity }) => {
    const errors = [];
    
    // Validate title
    if (!title?.trim()) {
      errors.push('Event title is required');
    } else if (title.trim().length < 3) {
      errors.push('Event title must be at least 3 characters');
    }
    
    // Validate date
    if (!date) {
      errors.push('Event date is required');
    } else {
      const eventDate = new Date(date);
      const now = new Date();
      
      if (isNaN(eventDate.getTime())) {
        errors.push('Invalid date format');
      } else if (eventDate <= now) {
        errors.push('Event date must be in the future');
      }
    }
    
    // Validate capacity
    if (capacity === undefined || capacity === null) {
      errors.push('Event capacity is required');
    } else if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      errors.push('Event capacity must be a positive integer');
    }
    
    return errors;
  },
  
  // Booking validation
  validateBookingData: ({ eventId }) => {
    const errors = [];
    
    if (!eventId) {
      errors.push('Event ID is required');
    } else if (!Number.isInteger(Number(eventId)) || Number(eventId) < 1) {
      errors.push('Invalid event ID');
    }
    
    return errors;
  }
};