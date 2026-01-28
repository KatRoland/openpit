import { config } from '../utils/config.js';
import { 
    mountableFileSystems, 
    mountFileSystem, 
    unmountFileSystem, 
    formatFileSystem, 
    deleteFileSystem
} from '../utils/filesystemUtils.js';

import { folderContents } from '@/helpers/fileHelper.js';

export const getMountableFileSystems = async (req: any, res: any) => {
    try {
        const mountables = await mountableFileSystems();
        res.status(200).json({ mountables });
    } catch (error: any) {
        return res.status(500).json({ error: "internal_server_error" });
    }
}

export const handleMountFileSystem = async (req: any, res: any) => {
    const { fileSystem } = req.body;
    try {
        if (!fileSystem) {
            return res.status(400).json({ error: "filesystem_required" });
        }

        const result = await mountFileSystem(fileSystem);
        res.status(result.statusCode).json({ message: result.message });
    } catch (error: any) {
        if (error.message === "device_not_found") {
            return res.status(404).json({ error: "device_not_found" });
        } else if (error.message === "not_a_valid_filesystem") {
            return res.status(400).json({ error: "not_a_valid_filesystem" });
        } else if (error.message === "mount_faiiled") {
            return res.status(500).json({ error: "mount_faiiled" });
        } else if( error.message === "already_mounted") {
            return res.status(400).json({ error: "already_mounted" });
        }
        else {
            return res.status(500).json({ error: "internal_server_error" });
        }
    }
}

export const handleUnmountFileSystem = async (req: any, res: any) => {
    const { fileSystem } = req.body;
    try {
        if (!fileSystem) {
            return res.status(400).json({ error: "filesystem_required" });
        }

        const result = await unmountFileSystem(fileSystem);
        res.status(result.statusCode).json({ message: result.message });
    } catch (error: any) {
        if (error.message === "device_not_found") {
            return res.status(404).json({ error: "device_not_found" });
        } else if (error.message === "unmount_failed") {
            return res.status(500).json({ error: "unmount_failed" });
        } else if( error.message === "not_mounted") {
            return res.status(400).json({ error: "not_mounted" });
        }
        else {
            return res.status(500).json({ error: "internal_server_error" });
        }
    }
}

export const handleFormatFileSystem = async (req: any, res: any) => {
    const { target } = req.body;
    try {
        if (!target) {
            return res.status(400).json({ error: "filesystem_required" });
        }

        const result = await formatFileSystem(target);
        res.status(result.statusCode).json({ message: result.message });
    } catch (error: any) {
        if (error.message === "device_not_found") {
            return res.status(404).json({ error: "device_not_found" });
        } else if (error.message === "format_failed") {
            return res.status(500).json({ error: "format_failed" });
        } else {
            return res.status(500).json({ error: "internal_server_error" });
        }
    }
}

export const handleDeleteFileSystem = async (req: any, res: any) => {
    const { target, disk, partition } = req.body;
    try {
        if (!target) {
            return res.status(400).json({ error: "filesystem_required" });
        }

        if(target != `${disk}${partition}`) {
            return res.status(400).json({ error: "invalid_target" });
        }

        const result = await deleteFileSystem(disk, partition);
        res.status(result.statusCode).json({ message: result.message });
    } catch (error: any) {
        if (error.message === "device_not_found") {
            return res.status(404).json({ error: "device_not_found" });
        } else if (error.message === "deletion_failed") {
            return res.status(500).json({ error: "deletion_failed" });
        } else if( error.message === "unmount_first") {
            return res.status(400).json({ error: "unmount_first" });
        }
        else {
            return res.status(500).json({ error: "internal_server_error" });
        }
    }
}

/** experimental function, will removed later when websocket is fully implemented */ 
export const getFolderContents = async (req: any, res: any) => {
    const { folderPath } = req.body;
    try {
        if (!folderPath) {
            return res.status(400).json({ error: "folder_path_required" });
        }

        const contents = await folderContents(folderPath);
        res.status(200).json({ contents });
    } catch (error: any) {
        if (error.message === "folder_not_found") {
            return res.status(404).json({ error: "folder_not_found" });
        } else if (error.message === "could_not_read_folder_contents") {
            return res.status(500).json({ error: "could_not_read_folder_contents" });
        } else {
            return res.status(500).json({ error: "internal_server_error" });
        }
    }
}