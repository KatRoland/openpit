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

export const systemUptime = () => {
    const data = fs.readFileSync('/proc/uptime', 'utf8');
    const uptimeSeconds = parseFloat(data.split(' ')[0]);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    
    return `${hours}h ${minutes}m ${seconds}s`;
};

export const cpuinfo = () => {
    const cpuInfoData = fs.readFileSync('/proc/cpuinfo', 'utf8');
    const lines = cpuInfoData.split('\n');
    let modelName = '';
    let cores = 0;

    lines.forEach(line => {
        if (line.startsWith('model name')) {
            if (!modelName) {
                modelName = line.split(':')[1].trim();
            }
            cores++;
        }
    });

    return {
        cpuModel: modelName,
        cpuCores: cores
    };
}

export const systemStats = () => {
    return {
        memory: getMemoryStats(),
        cpuLoad: getCPULoad(),
        uptime: systemUptime(),
        cpuInfo: cpuinfo()
    };
}