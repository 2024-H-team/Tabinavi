import { Request, Response, NextFunction } from 'express';

export const checkApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const clientKey = req.headers['x-api-key'] || req.query.apiKey;
    const keyString = Array.isArray(clientKey) ? clientKey[0] : clientKey;

    if (!keyString) {
        res.status(401).json({ error: 'Missing API key' });
        return;
    }

    if (keyString !== process.env.PROTECT_API_KEY) {
        res.status(401).json({ error: 'Invalid API key' });
        return;
    }

    next();
};
