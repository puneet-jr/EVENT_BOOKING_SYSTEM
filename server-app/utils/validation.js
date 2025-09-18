export const ValidationUtils = {
  validateSignupData: ({ name, email, password }) => {
    const errors = [];
    if (!name?.trim()) errors.push('Name is required');
    if (!email?.trim()) errors.push('Email is required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.trim())) errors.push('Invalid email format');
    return errors;
  },
  validateLoginData: ({ email, password }) => {
    const errors = [];
    if (!email?.trim()) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    return errors;
  },
};