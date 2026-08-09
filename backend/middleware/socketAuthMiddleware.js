import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { ENV } from '../lib/env.js'

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers?.cookie;
        let token = socket.handshake.auth?.token;

        if (!token && cookieHeader) {
            const cookies = Object.fromEntries(
                cookieHeader.split(';').map(c => {
                    const [k, ...v] = c.trim().split('=');
                    return [k, v.join('=')];
                })
            );
            token = cookies.jwt;
        }

        if (!token) {
            console.log('socket connection rejected: No token provided');
            return next(new Error('Unauthorized - No token provided'));
        }

        const decode = jwt.verify(token, ENV.JWT_SECRET);
        if (!decode) {
            console.log('socket connection rejected: Invalid token');
            return next(new Error('Unauthorized - Invalid token'));
        }

        const user = await User.findById(decode.userId).select('-password');
        if (!user) {
            console.log('socket connection rejected: User not found');
            return next(new Error('Unauthorized - User not found')); 
        }

        socket.user = user;
        socket.userId = user._id.toString();

        console.log(`Socket authenticated for user : ${user.fullName} (${user._id})`);
        next();
    } catch (error) {
        console.log('Error in socket authentication:', error.message);
        next(new Error('Unauthorized - Authentication failed'));
    }
}