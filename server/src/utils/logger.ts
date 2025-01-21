import { Request } from 'express';
import { appendLogToFile } from './fileUtils';
import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const setIO = (io: Server) => {
    ioInstance = io;
};

export const logWithIp = (req: Request, message: string, timeStamp: string, userId?: number | string): void => {
    const clientIp = req.headers['x-forwarded-for']
        ? (req.headers['x-forwarded-for'] as string).split(',')[0].trim()
        : req.socket.remoteAddress || 'Unknown IP';

    const logEntry = `[[IP: ${clientIp}] , ${userId?.toString()}, ${message} at ${timeStamp}]`;

    appendLogToFile(logEntry);

    if (ioInstance) {
        ioInstance.emit('log', logEntry);
    }

    console.log(logEntry);
};
