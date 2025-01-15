import { appendLogToFile, readLogsFromFile } from '../utils/fileUtils';

export const addLog = (log: string): void => {
    appendLogToFile(log);
};

export const getAllLogs = (): string[] => {
    return readLogsFromFile();
};
