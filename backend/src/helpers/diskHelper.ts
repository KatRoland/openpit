import { exec } from 'child_process';
import { promisify } from 'util';
import { BlockDevice, DiskUsageInfo, ChildrenStatus } from '../types/disk.js';
const execAsync = promisify(exec);

export function getUsedBytes(children: BlockDevice[]): number {
    if(children.find(child => child.children && child.children.length > 0)) {
        return children.reduce((total, child) => {
            const childUsage = child.children ? getUsedBytes(child.children) : 0;
            return total + childUsage;
        },0);
    }
    return children.reduce((total, child) => {
        const fsused = child.fsused ? child.fsused : 0;
        return total + fsused;
    },0);
}

export async function mountableFileSystemsHelper(disk: BlockDevice): Promise<BlockDevice[]> {
    const mountables = [] as BlockDevice[];
    if (disk.children && disk.children.length > 0) {
        for (const child of disk.children) {
            const childMountables = await mountableFileSystemsHelper(child);
            mountables.push(...childMountables);
        }
    } else {
        if (!disk.mountpoint && disk.fstype !== null) {
            mountables.push(disk);
        }
    }
    return mountables;
}

export const isFsMounted = async (fsName: string): Promise<boolean> => {
    try {
        await execAsync(`findmnt /dev/${fsName}`);
        return true;
    } catch {
        return false;
    }
}

export const isFsExists = async (fsName: string): Promise<boolean> => {
    try {
        const { stdout } = await execAsync(`lsblk /dev/${fsName}`);
        return stdout.includes(fsName);
    } catch {
        return false;
    }
}