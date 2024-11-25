import './config/loadEnv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import webRoutes from './routers/web';

const app = express();

const port: number = parseInt(process.env.PORT as string, 10) || 3000;
const host: string = process.env.HOST_NAME || 'localhost';

app.use(cors());

app.use(express.json());

app.use('/api', webRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
