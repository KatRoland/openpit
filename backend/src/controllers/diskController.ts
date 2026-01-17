import { config } from '../utils/config.js';
import { getDiskList, getDiskUsage, getDiskUsageByDisk } from '../utils/diskHelper.js';

export const getAllDisk = async (req: any, res: any) => {
    const disks = await getDiskList();

    res.status(200).json({ disks });
};


export const getDiskUsages = async (req: any, res: any) => {
    const usage = await getDiskUsage();

    res.status(200).json({ usage });
}

export const getDiskUsageForDisk = async (req: any, res: any) => {
    const { diskName } = req.params;
    try {
        if (!diskName) {
            return res.status(400).json({ error: "disk_name_required" });
        }

        const usage = await getDiskUsageByDisk(diskName);

    if (!usage) {
        return res.status(404).json({ message: "Disk usage not found for the specified disk." });
    }
    res.status(200).json({ usage });
    } catch (error: any) {
        if(error.message === "could_not_fetch_disk_usage_by_disk") {
            return res.status(400).json({ error: "invalid_disk_name" });
        }
    }

}