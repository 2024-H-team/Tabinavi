import express from 'express';
import { chatController } from '../controllers/chatController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = express.Router();

router.post('/', asyncHandler(chatController));

export default router;
