import { addLog } from "./db";

const logMessage = async (level, ...args) => {
    const message = `${level.toUpperCase()}: ${args.join(' ')}`;

    // Store the log in IndexedDB
    try {
        await addLog(message);
    } catch (error) {
        console.error('Failed to log message:', error); // Use original console.error
    }
};

const logger = {
    log: async (...args) => await logMessage('log', ...args),
    error: async (...args) => await logMessage('error', ...args),
    warn: async (...args) => await logMessage('warn', ...args),
};

export default logger;