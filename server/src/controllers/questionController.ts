import { Request, Response, NextFunction } from 'express';
import { QuestionModel, UserAnswer } from '../models/questionModel';
import mysql from 'mysql2/promise';
import { getCurrentTime } from '~/utils/timeNow';
import { logWithIp } from '~/utils/logger';

interface AuthRequest extends Request {
    user?: {
        userId: number;
    };
}

interface AnswersRequestBody {
    answers: UserAnswer[];
}

export class QuestionController {
    private questionModel: QuestionModel;

    constructor(pool: mysql.Pool) {
        this.questionModel = new QuestionModel(pool);
    }

    async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const questions = await this.questionModel.getAllQuestionsWithChoices();

            res.status(200).json({
                success: true,
                data: questions,
            });
        } catch (error) {
            next(error);
        }
    }

    async submitAnswers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { answers } = req.body as AnswersRequestBody;
            if (!Array.isArray(answers) || !answers.length) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid answers format',
                });
                return;
            }

            const { responseId, isUpdate } = await this.questionModel.submitUserAnswers(userId, answers);
            // console.log('Answers submitted:', userId, getCurrentTime());
            logWithIp(req, 'Answers submitted', getCurrentTime(), userId);
            res.status(201).json({
                success: true,
                message: 'Answers submitted successfully',
                data: {
                    responseId,
                    isUpdate,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserAnswers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const answers = await this.questionModel.getUserAnswers(userId);

            res.status(200).json({
                success: true,
                data: answers,
            });
        } catch (error) {
            next(error);
        }
    }
}
