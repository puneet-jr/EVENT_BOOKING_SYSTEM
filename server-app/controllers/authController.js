import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/authService.js';
import { TokenUtils } from '../utils/tokenUtils.js';
import { ValidationUtils } from '../utils/validation.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const errors = ValidationUtils.validateSignupData({ name, email, password });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  try {
    const user = await AuthService.createUser({ name, email, password, role });
    const token = TokenUtils.generate(user.id, user.role);
    res.status(201).json({ message: 'Account created successfully', token, user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const errors = ValidationUtils.validateLoginData({ email, password });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  const user = await AuthService.findUserByEmail(email);
  if (!user || !(await AuthService.verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = TokenUtils.generate(user.id, user.role);
  await AuthService.updateLastLogin(user.id);

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});