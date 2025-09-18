import jwt from 'jsonwebtoken';

export const TokenUtils = {
  generate: (userId, userRole) =>
    jwt.sign({ id: userId, role: userRole }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  verify: (token) => jwt.verify(token, process.env.JWT_SECRET),
};
