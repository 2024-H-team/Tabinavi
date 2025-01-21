import { Request, Response } from 'express';
import { getAllLogs } from '../models/logModel';

export const getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const logs = getAllLogs();
        res.json(logs);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
};
