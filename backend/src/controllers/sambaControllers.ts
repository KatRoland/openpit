import { config } from '../utils/config.js';
import { 
    shareFolder,
    unshareFolder,
    listSharedFolders
} from '../utils/sambaUtils.js';

export const handleShareFolder = async (req: any, res: any) => {
    const { folderPath, sharedName } = req.body;
    try {
        if (!folderPath) {
            return res.status(400).json({ error: "folder_path_required" });
        }

        if (!sharedName) {
            return res.status(400).json({ error: "shared_name_required" });
        }

        const result = await shareFolder(folderPath, sharedName);
        res.status(result.statusCode).json({ message: result.message });
    } catch (error: any) {
        if (error.message === "folder_not_found") {
            return res.status(404).json({ error: "folder_not_found" });
        } else if (error.message === "samba_share_failed") {
            return res.status(500).json({ error: "samba_share_failed" });
        }
    }
}

export const handleUnShareFolder = async (req: any, res: any) => {
    const { sharedName } = req.body;
    try {
        if (!sharedName) {
            return res.status(400).json({ error: "shared_name_required" });
        }

        const result = await unshareFolder(sharedName);
        res.status(result.statusCode).json({ message: result.message });
    } catch (error: any) {
        if (error.message === "folder_not_found") {
            return res.status(404).json({ error: "folder_not_found" });
        } else if (error.message === "unshare_failed") {
            return res.status(500).json({ error: "unshare_failed" });
        }
    }
}

export const getSharedFolders = async (req: any, res: any) => {
    try {
        const sharedFolders = await listSharedFolders();
        res.status(200).json({ sharedFolders });
    } catch (error) {
        res.status(500).json({ error: "could_not_fetch_shared_folders" });
    }
}