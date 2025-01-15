import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ScheduleModel } from '../models/scheduleModel';

interface AuthRequest extends Request {
    user?: {
        userId: number;
        userName: string;
        iat?: number;
        exp?: number;
    };
}

export const createScheduleValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('start_date').isDate().withMessage('Start date must be a valid date'),
    body('end_date').isDate().withMessage('End date must be a valid date'),
    body('schedules').isString().notEmpty().withMessage('Schedules data is required'),
];

export const updateScheduleValidation = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('start_date').optional().isDate().withMessage('Start date must be a valid date'),
    body('end_date').optional().isDate().withMessage('End date must be a valid date'),
    body('schedules').optional().isString().notEmpty().withMessage('Schedules data cannot be empty'),
];

export class ScheduleController {
    private scheduleModel: ScheduleModel;

    constructor(scheduleModel: ScheduleModel) {
        this.scheduleModel = scheduleModel;
    }

    async createSchedule(req: AuthRequest, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            const newSchedule = await this.scheduleModel.createSchedule({
                userId,
                title: req.body.title,
                start_date: new Date(req.body.start_date),
                end_date: new Date(req.body.end_date),
                schedules: req.body.schedules,
            });

            return res.status(201).json({
                success: true,
                message: 'Schedule created successfully',
                data: newSchedule,
            });
        } catch (error) {
            console.error('Create schedule error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }

    async getAllSchedulesByUserId(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            const userSchedules = await this.scheduleModel.getSchedulesByUserId(userId);

            return res.status(200).json({
                success: true,
                message: 'Schedules retrieved successfully',
                data: {
                    schedules: userSchedules,
                    count: userSchedules.length,
                },
            });
        } catch (error) {
            console.error('Get all schedules error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
    async updateSchedule(req: AuthRequest, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array(),
                });
            }

            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }

            const scheduleId = parseInt(req.params.id);
            if (isNaN(scheduleId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid schedule ID',
                });
            }

            const updateResult = await this.scheduleModel.updateSchedule(scheduleId, {
                userId,
                title: req.body.title,
                start_date: req.body.start_date && new Date(req.body.start_date),
                end_date: req.body.end_date && new Date(req.body.end_date),
                schedules: req.body.schedules,
            });

            if (!updateResult) {
                return res.status(404).json({
                    success: false,
                    message: 'Schedule not found or unauthorized',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Schedule updated successfully',
            });
        } catch (error) {
            console.error('Update schedule error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}
