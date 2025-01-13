import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

import { initGraph } from './utils/graphManager';
import webRoutes from './routers/web';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: '*',
        credentials: false,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', webRoutes);

// Default route serves index.html
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize graph and start server
(async () => {
    try {
        await initGraph();
        console.log('Graph is ready for use.');

        const PORT = parseInt(process.env.PORT || '3000', 10);
        const HOST = process.env.HOST_NAME || 'localhost';

        app.listen(PORT, HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize graph:', error);
        process.exit(1);
    }
})();
