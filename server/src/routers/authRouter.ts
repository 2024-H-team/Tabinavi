// src/routers/authRouter.ts

import express from 'express';
import { UserController, registerValidation } from '../controllers/userController';
import { asyncHandler } from '../middlewares/asyncHandler';
import { UserModel } from '../models/userModel';
import pool from '../config/database';

const router = express.Router();
const userModel = new UserModel(pool);
const userController = new UserController(userModel);

router.post(
    '/register',
    registerValidation,
    asyncHandler((req, res) => userController.register(req, res)),
);

export default router;
