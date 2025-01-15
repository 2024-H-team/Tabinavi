import fs from 'fs';
import path from 'path';

const dataFolderPath = path.join(__dirname, 'data');
const logFilePath = path.join(dataFolderPath, 'logs.json');

export const ensureDataFolderExists = () => {
    if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
    }
    if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, '[]');
    }
};

// Append a log entry to the JSON file
export const appendLogToFile = (log: string) => {
    ensureDataFolderExists();

    const fileContent = fs.readFileSync(logFilePath, 'utf-8');
    const logs: string[] = JSON.parse(fileContent || '[]');
    logs.push(log);

    // Keep the latest 100 logs
    fs.writeFileSync(logFilePath, JSON.stringify(logs.slice(-100), null, 2));
};

// Read logs from the file
export const readLogsFromFile = (): string[] => {
    ensureDataFolderExists();
    const fileContent = fs.readFileSync(logFilePath, 'utf-8');
    return JSON.parse(fileContent || '[]');
};
