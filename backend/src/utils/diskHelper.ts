import { exec } from 'child_process';
import { promisify } from 'util';
import { BlockDevice, DiskUsageInfo } from '../types/disk.js';

const execAsync = promisify(exec);

     export async function getDiskList(): Promise<BlockDevice[]> {
        try {
            const { stdout } = await execAsync('lsblk -J -o NAME,SIZE,FSTYPE,MOUNTPOINT,MODEL,TYPE,ROTA');
            const parsed = JSON.parse(stdout);
            return parsed.blockdevices || [];
        } catch (error) {
            console.error("Disk list error:", error);
            throw new Error("could_not_fetch_disk_list");
        }
    }

        export async function getDiskUsage(): Promise<DiskUsageInfo[]> {
        try {
            const { stdout } = await execAsync('df -h --output=source,size,used,avail,pcent,target -x tmpfs -x devtmpfs');
            
            const lines = stdout.trim().split('\n').slice(1);
            
            return lines.map(line => {
                const [filesystem, size, used, avail, usePercent, mountedOn] = line.split(/\s+/);
                return { filesystem, size, used, avail, usePercent, mountedOn };
            });
        } catch (error) {
            console.error("disk usage error:", error);
            throw new Error("could_not_fetch_disk_usage");
        }
    }