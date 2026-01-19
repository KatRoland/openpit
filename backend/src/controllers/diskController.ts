import { config } from '../utils/config.js';
import { getDiskList, getDiskUsage, getDiskUsageByDisk, initDisk, diskStatus, mountableFileSystems } from '../utils/diskUtils.js';

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

export const initDiskController = async (req: any, res: any) => {
    const { diskName } = req.body;
    try {
        if (!diskName) {
            return res.status(400).json({ error: "disk_name_required" });
        }

        const result = await initDisk(diskName);
        res.status(result.statusCode).json({ message: result.message });
    } catch (error: any) {
        if (error.message === "disk_not_found") {
            return res.status(404).json({ error: "disk_not_found" });
        } else if (error.message === "disk_initialization_failed") {
            return res.status(500).json({ error: "disk_initialization_failed" });
        } else if (error.message === "unmount_first") {
            return res.status(400).json({ error: "unmount_first" });
        }
         else {
            return res.status(500).json({ error: "internal_server_error" });
        }
    }
}

export const getDiskStatus = async (req: any, res: any) => {
    const { diskName } = req.params;
    try {
        if (!diskName) {
            return res.status(400).json({ error: "disk_name_required" });
        }

        const childrens = await diskStatus(diskName);
        res.status(200).json({ childrens });
    } catch (error: any) {
        if (error.message === "disk_not_found") {
            return res.status(404).json({ error: "disk_not_found" });
        } else {
            return res.status(500).json({ error: "internal_server_error" });
        }
    }
}

export const getMountableFileSystems = async (req: any, res: any) => {
    try {
        const mountables = await mountableFileSystems();
        res.status(200).json({ mountables });
    } catch (error: any) {
        return res.status(500).json({ error: "internal_server_error" });
    }
}

