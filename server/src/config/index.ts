import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define types for the configuration
interface DBConfig {
    host: string | undefined;
    port: string | undefined;
    user: string | undefined;
    password: string | undefined;
    database: string | undefined;
    dialect: string | undefined;
}

interface Config {
    port: number;
    dbConfig: DBConfig;
}

// Export the configuration
const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    dbConfig: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dialect: process.env.DB_DIALECT,
    },
};

export default config;
