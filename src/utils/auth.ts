import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (userId: string, email: string, role: string) => {
  // Check if secrets exist
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets are not defined in environment variables');
  }

  const accessToken = jwt.sign(
    { userId, email, role },
    jwtSecret,
    { expiresIn: '15m' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId },
    jwtRefreshSecret,
    { expiresIn: '7d' } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string) => {
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  return jwt.verify(token, secret);
};