import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};
export const comparePasswords = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
export const generateTokens = (userId, email, role) => {
    // Check if secrets exist
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets are not defined in environment variables');
    }
    const accessToken = jwt.sign({ userId, email, role }, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, jwtRefreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
export const verifyToken = (token, secret) => {
    if (!secret) {
        throw new Error('JWT secret is not defined');
    }
    return jwt.verify(token, secret);
};
