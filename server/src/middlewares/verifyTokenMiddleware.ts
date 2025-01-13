import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        userId: number;
        userName: string;
        iat?: number;
        exp?: number;
    };
}

export const verifyTokenMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.LOGIN_TOKEN_KEY as string) as {
            userId: number;
            userName: string;
        };
        req.user = decoded;
        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
        return;
    }
};
