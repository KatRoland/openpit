import { config } from '../utils/config.js';
import { getMemoryStats, getCPULoad } from '../utils/sysusage.js';

export const getSystemStats = (req: any, res: any) => {
    const memoryStats = getMemoryStats();
    const cpuLoad = getCPULoad();    
    res.status(200).json({ memory: memoryStats, cpu: cpuLoad });
};
