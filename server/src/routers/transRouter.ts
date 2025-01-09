import express from 'express';
import { getRoute } from '../controllers/routeController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = express.Router();

router.post('/', asyncHandler(getRoute));

export default router;
