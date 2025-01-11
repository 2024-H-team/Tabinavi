import express, { Router } from 'express';
import { RecommendedPlaceController } from '../controllers/recommendedPlaceController';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import pool from '../config/database';

const router: Router = express.Router();
const recommendedPlaceController = new RecommendedPlaceController(pool);

router.post('/recommended-place-types', verifyTokenMiddleware as express.RequestHandler, (req, res, next) =>
    recommendedPlaceController.getRecommendedPlaceTypes(req, res, next),
);

export default router;
