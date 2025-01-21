import express from 'express';
import { getLogs } from '../controllers/logController';
import { checkApiKey } from '../middlewares/checkApiKey';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = express.Router();

router.get('/', checkApiKey, asyncHandler(getLogs));

export default router;
