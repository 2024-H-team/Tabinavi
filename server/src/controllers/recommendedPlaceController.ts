import { Request, Response, NextFunction } from 'express';
import { RecommendedPlaceModel, SelectedPlace } from '../models/PlaceRecommendationModel';
import mysql from 'mysql2/promise';
import { getCurrentTime } from '~/utils/timeNow';

interface AuthRequest extends Request {
    user?: {
        userId: number;
    };
}

export class RecommendedPlaceController {
    private recommendedPlaceModel: RecommendedPlaceModel;

    constructor(pool: mysql.Pool) {
        this.recommendedPlaceModel = new RecommendedPlaceModel(pool);
    }

    async getRecommendedPlaceTypes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const { selectedPlaces, dayStartTime, dayEndTime } = req.body as {
                selectedPlaces: SelectedPlace[];
                dayStartTime?: string;
                dayEndTime?: string;
            };

            const recommendation = await this.recommendedPlaceModel.fetchRecommendedPlaceTypes(
                userId,
                selectedPlaces || [],
                dayStartTime,
                dayEndTime,
            );

            console.log('Recommended place types fetched:', userId, getCurrentTime());
            if (recommendation.success) {
                res.status(200).json({
                    success: true,
                    data: recommendation.types,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: recommendation.error || 'Failed to get recommended place types',
                });
            }
        } catch (error) {
            console.error('Error in getRecommendedPlaceTypes:', error);
            next(error);
        }
    }
}
