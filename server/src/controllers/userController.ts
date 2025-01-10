import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/registerModel';

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
}
