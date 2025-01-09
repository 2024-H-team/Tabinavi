import mysql, { PoolOptions, Pool } from 'mysql2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the connection pool options
const poolOptions: PoolOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

// Create a connection pool
const pool: Pool = mysql.createPool(poolOptions);

export default pool.promise();
