import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/userModel';
import jwt from 'jsonwebtoken';
import { getCurrentTime } from '~/utils/timeNow';

export const registerValidation = [
    body('userName').trim().isLength({ min: 3, max: 30 }).withMessage('ユーザー名は3〜30文字である必要があります'),
    body('email').isEmail().normalizeEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('パスワードは6文字以上である必要があります')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        .withMessage('パスワードは少なくとも1つの文字と1つの数字を含む必要があります'),
    body('fullName').trim().notEmpty().withMessage('氏名は必須項目です'),
];

export const loginValidation = [
    body('userName').trim().notEmpty().withMessage('ユーザー名を入力してください'),
    body('password').notEmpty().withMessage('パスワードを入力してください'),
];

export class UserController {
    private userModel: UserModel;

    constructor(userModel: UserModel) {
        this.userModel = userModel;
    }

    async register(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const userExists = await this.userModel.checkUserExists(req.body.userName, req.body.email);

            if (userExists) {
                return res.status(409).json({
                    success: false,
                    message: 'ユーザー名またはメールアドレスは既に使用されています',
                });
            }

            const newUser = await this.userModel.registerUser({
                userName: req.body.userName,
                password: req.body.password,
                email: req.body.email,
                fullName: req.body.fullName,
                avatar: req.body.avatar,
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = newUser;
            console.log('User registered:', newUser.userName, getCurrentTime());
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
                    message: 'ユーザー名またはパスワードが正しくありません',
                });
            }

            const firstLogin = await this.userModel.checkAndUpdateFirstLogin(user.userID!);

            const token = jwt.sign(
                { userId: user.userID, userName: user.userName },
                process.env.LOGIN_TOKEN_KEY as string,
                { expiresIn: '7d' },
            );

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = {
                ...user,
                avatar: user.avatar || null,
            };

            console.log('User logged in:', user.userName, getCurrentTime());
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: userWithoutPassword,
                    firstLogin,
                },
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
