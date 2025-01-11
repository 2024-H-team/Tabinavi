// recommendedPlaceController.ts
import { Request, Response, NextFunction } from 'express';
import { RecommendedPlaceModel, SelectedPlace } from '../models/PlaceRecommendationModel';
import mysql from 'mysql2/promise';

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

    /**
     * Handles the request to get recommended place types.
     * @param req - The request object containing user info and selected places.
     * @param res - The response object to send back the recommended types.
     * @param next - The next middleware function.
     */
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

            const selectedPlaces: SelectedPlace[] = req.body.selectedPlaces || [];

            // Validate selectedPlaces if necessary
            // ...

            const recommendation = await this.recommendedPlaceModel.fetchRecommendedPlaceTypes(userId, selectedPlaces);

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
