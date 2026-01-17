import { config } from '../utils/config.js';
import { getDiskList} from '../utils/diskHelper.js';

export const getAllDisk = async (req: any, res: any) => {
    const disks = await getDiskList();

    res.status(200).json({ disks });
};
