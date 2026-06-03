import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'CHANGE_ME_ACCESS_SECRET';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'CHANGE_ME_REFRESH_SECRET';

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId, role }, REFRESH_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET);
};
