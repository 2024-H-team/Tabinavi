import express from 'express';
import { Request, Response } from 'express';
import { UserController, registerValidation, loginValidation } from '../controllers/userController';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';
import { UserModel } from '../models/userModel';
import pool from '../config/database';
import multer from 'multer';

const router = express.Router();
const userModel = new UserModel(pool);
const userController = new UserController(userModel);

const upload = multer({ storage: multer.memoryStorage() });

interface AuthRequest extends Request {
    user?: {
        userId: number;
        userName: string;
        iat?: number;
        exp?: number;
    };
}

router.post(
    '/register',
    registerValidation,
    asyncHandler((req, res) => userController.register(req, res)),
);

router.post(
    '/login',
    loginValidation,
    asyncHandler((req, res) => userController.login(req, res)),
);

router.put(
    '/update-profile',
    verifyTokenMiddleware,
    upload.single('avatar'),
    asyncHandler((req, res) => userController.updateProfile(req, res)),
);

router.get(
    '/verify-token',
    verifyTokenMiddleware,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        return res.status(200).json({
            success: true,
            message: 'Token is valid',
        });
    }),
);

export default router;
