import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/userModel';
import jwt from 'jsonwebtoken';

export const registerValidation = [
    body('userName').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
];

export const loginValidation = [
    body('userName').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

export class UserController {
    private userModel: UserModel;

    constructor(userModel: UserModel) {
        this.userModel = userModel;
    }

    async register(req: Request, res: Response) {
        try {
            // Check validation results
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            // Check if user exists
            const userExists = await this.userModel.checkUserExists(req.body.userName, req.body.email);

            if (userExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Username or email already exists',
                });
            }

            // Register user
            const newUser = await this.userModel.registerUser({
                userName: req.body.userName,
                password: req.body.password,
                email: req.body.email,
                fullName: req.body.fullName,
                avatar: req.body.avatar,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = newUser;

            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: userWithoutPassword,
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const user = await this.userModel.loginUser(req.body.userName, req.body.password);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password',
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.userID, userName: user.userName },
                process.env.LOGIN_TOKEN_KEY as string,
                { expiresIn: '7d' },
            );

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'lax',
                path: '/',
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = user;

            console.log('User logged in:', user.userName);
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: userWithoutPassword,
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}
