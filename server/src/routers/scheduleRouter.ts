import express from 'express';
import {
    ScheduleController,
    createScheduleValidation,
    updateScheduleValidation,
} from '../controllers/scheduleController';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ScheduleModel } from '../models/scheduleModel';
import pool from '../config/database';

const router = express.Router();
const scheduleModel = new ScheduleModel(pool);
const scheduleController = new ScheduleController(scheduleModel);

router.post(
    '/create',
    verifyTokenMiddleware,
    createScheduleValidation,
    asyncHandler((req, res) => scheduleController.createSchedule(req, res)),
);

router.get(
    '/list',
    verifyTokenMiddleware,
    asyncHandler((req, res) => scheduleController.getAllSchedulesByUserId(req, res)),
);
router.put(
    '/:id',
    verifyTokenMiddleware,
    updateScheduleValidation,
    asyncHandler((req, res) => scheduleController.updateSchedule(req, res)),
);
export default router;
