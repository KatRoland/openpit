import { config } from '../utils/config.js';
import { getDiskList, getDiskUsage } from '../utils/diskHelper.js';

export const getAllDisk = async (req: any, res: any) => {
    const disks = await getDiskList();

    res.status(200).json({ disks });
};


export const getDiskUsages = async (req: any, res: any) => {
    const usage = await getDiskUsage();

    res.status(200).json({ usage });
}