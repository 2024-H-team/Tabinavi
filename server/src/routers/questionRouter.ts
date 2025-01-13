// questionRouter.ts
import express, { Router } from 'express';
import { QuestionController } from '../controllers/questionController';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import pool from '../config/database';

const router: Router = express.Router();
const questionController = new QuestionController(pool);

router.get('/questions', (req, res, next) => questionController.getQuestions(req, res, next));

router.post('/answers', verifyTokenMiddleware as express.RequestHandler, (req, res, next) =>
    questionController.submitAnswers(req, res, next),
);

router.get('/answers', verifyTokenMiddleware as express.RequestHandler, (req, res, next) =>
    questionController.getUserAnswers(req, res, next),
);

export default router;
