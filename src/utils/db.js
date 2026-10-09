import { openDB } from 'idb';

const initDB = async () => {
    const db = await openDB('ConsoleLogsDB', 1, {
        upgrade(db) {
            db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
        },
    });
    return db;
};

const addLog = async (log) => {
    const db = await initDB();
    
    // Get all logs and filter out those older than 14 days
    const logs = await db.getAll('logs');
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Delete logs older than 14 days
    const deletePromises = logs
        .filter(existingLog => existingLog.timestamp < fourteenDaysAgo)
        .map(oldLog => db.delete('logs', oldLog.id));
    
    await Promise.all(deletePromises); // Wait for all delete operations to complete

    // Add the new log
    await db.add('logs', { message: log, timestamp: new Date().toISOString() });
};

const formatDateToDDMMYY = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}${month}${year}`;
};

const retrieveLogs = async () => {
    const db = await initDB();
    const logs = await db.getAll('logs');

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const date = new Date();

    a.download = `SPI(${date.toISOString()})${formatDateToDDMMYY(date)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log(`${logs.length} logs retrieved and downloaded.`);
    // Removed deletion logic
};
export { addLog, retrieveLogs };
