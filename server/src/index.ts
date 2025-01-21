import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
// import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { initGraph } from './utils/graphManager';
import webRoutes from './routers/web';

import { createServer } from 'http';
import { addLog } from './models/logModel';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();

app.set('trust proxy', true);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

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
// app.use(morgan('dev'));

// Routes
app.use('/api', webRoutes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
});

const originalConsoleLog = console.log;
console.log = (...args: unknown[]) => {
    const log = args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
    addLog(log);
    io.emit('log', log);
    originalConsoleLog(...args);
};

// Initialize graph and start server
(async () => {
    try {
        await initGraph();
        console.log('Graph is ready for use.');

        const PORT = parseInt(process.env.PORT || '3000', 10);
        const HOST = process.env.HOST_NAME || 'localhost';

        httpServer.listen(PORT, HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize graph:', error);
        process.exit(1);
    }
})();
