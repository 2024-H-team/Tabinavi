import { Request, Response } from 'express';
import { getResponseFromOpenAI } from '../models/openaiModel';

export async function chatController(req: Request, res: Response): Promise<Response> {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const responseMessage = await getResponseFromOpenAI(message, history);
        return res.json({ message: responseMessage });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
}
