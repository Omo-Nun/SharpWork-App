import jwt from 'jsonwebtoken';
import { getJwtAccessSecret, getJwtRefreshSecret } from '../config/env';

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, getJwtAccessSecret(), { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId, role }, getJwtRefreshSecret(), { expiresIn: '30d' });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, getJwtAccessSecret());
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, getJwtRefreshSecret());
};
