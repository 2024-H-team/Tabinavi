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
export const verifyTokenMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const decoded = jwt.verify(token, process.env.LOGIN_TOKEN_KEY as string) as {
            userId: number;
            userName: string;
        };
        // Attach user info to request object
        req.user = decoded;
        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};
