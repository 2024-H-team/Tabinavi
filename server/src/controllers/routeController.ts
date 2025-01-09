import { Request, Response } from 'express';
import { findShortestRoute } from '../models/routeModel';

export const getRoute = async (req: Request, res: Response): Promise<Response> => {
    const { startStation, endStation } = req.body;

    if (!startStation || !endStation) {
        return res.status(400).json({
            error: 'Please enter both start and end station names',
        });
    }

    try {
        const result = await findShortestRoute(startStation, endStation);
        return res.status(200).json(result);
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({
            error: 'An error occurred while finding the route',
        });
    }
};
