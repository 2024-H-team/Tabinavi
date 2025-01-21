import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel, UserUpdate } from '../models/userModel';
import jwt from 'jsonwebtoken';
import { getCurrentTime } from '~/utils/timeNow';
import { processAndUploadImage } from '~/utils/imageUtils';
import { logWithIp } from '~/utils/logger';
interface AuthRequest extends Request {
    user?: {
        userId: number;
        userName: string;
        iat?: number;
        exp?: number;
    };
}

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
            // console.log('User registered:', newUser.userName, getCurrentTime());
            logWithIp(req, 'User registered: ' + newUser.userName, getCurrentTime(), newUser.userID);
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

            // console.log('User logged in:', user.userName, getCurrentTime());
            logWithIp(req, 'User logged in: ' + user.userName, getCurrentTime(), user.userID);
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

    async updateProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: '認証が必要です' });
            }
            const userID = req.user.userId;

            let avatar: string | undefined;
            if (req.file) {
                const fileName = `avatars/${userID}_${Date.now()}.webp`;
                avatar = await processAndUploadImage(req.file.buffer, fileName);
            }

            const payload: UserUpdate = {
                userID,
                email: req.body.email,
                fullName: req.body.fullName,
                avatar,
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword,
            };

            await this.userModel.updateUser(payload);

            const updatedUser = await this.userModel.getUserById(userID);
            if (!updatedUser) {
                throw new Error('User not found');
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = updatedUser;
            // console.log('User profile updated:', updatedUser.userName, getCurrentTime());
            logWithIp(req, 'User profile updated: ' + updatedUser.userName, getCurrentTime(), updatedUser.userID);
            return res.status(200).json({
                success: true,
                message: 'プロフィールが正常に更新されました',
                data: userWithoutPassword,
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return res.status(404).json({ success: false, message: 'ユーザーが見つかりません' });
                }
                if (error.message === 'Current password is incorrect') {
                    return res.status(401).json({ success: false, message: '現在のパスワードが間違っています' });
                }
                if (error.message === 'Current password is required to set a new password') {
                    return res
                        .status(400)
                        .json({ success: false, message: '新しいパスワードを設定するには現在のパスワードが必要です' });
                }
                console.error(error);
                return res.status(500).json({ success: false, message: 'サーバー内部エラー' });
            }
        }
    }
}
