import fs from 'fs';

export const getMemoryStats = () => {
    const data = fs.readFileSync('/proc/meminfo', 'utf8');
    const lines = data.split('\n');
    
    const memTotal = parseInt(lines[0].replace(/\D/g, ''));
    const memAvailable = parseInt(lines[2].replace(/\D/g, ''));
    
    const usedPercent = ((memTotal - memAvailable) / memTotal) * 100;
    
    return {
        totalGB: (memTotal / 1024 / 1024).toFixed(2),
        availableGB: (memAvailable / 1024 / 1024).toFixed(2),
        usedPercentage: usedPercent.toFixed(1)
    };
};

export const getCPULoad = () => {
    const data = fs.readFileSync('/proc/loadavg', 'utf8');
    const loads = data.split(' ');
    return {
        oneMinute: loads[0],
        fiveMinutes: loads[1],
        fifteenMinutes: loads[2]
    };
};