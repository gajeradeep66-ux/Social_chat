import jwt from 'jsonwebtoken'
import { ENV } from './env.js'

export const generateToken = (userId, res) => {
    const { JWT_SECRET } = ENV;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

    const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '7d',
    });

    const isProduction = ENV.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';

    if (res && typeof res.cookie === 'function') {
        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
        });
    }

    return token;
}
