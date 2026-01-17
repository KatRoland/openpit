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

        export async function getDiskUsageByDisk (diskName: string): Promise<DiskUsageInfo | null> {
        try {
            const blocks = await execAsync(`lsblk -bJ -o NAME,SIZE,FSUSED /dev/${diskName}`);
            const parsed = JSON.parse(blocks.stdout);
            const blockDevices = parsed.blockdevices as Array<{ name: string; size: string; fsused?: string }>;
            const disk = blockDevices.find(device => device.name === diskName);


            if (!disk) {
                return null;
            }

            const sizeBytes = parseInt(disk.size, 10);
            const usedBytes = getUsedBytes (parsed.blockdevices[0].children);
            const availBytes = sizeBytes - usedBytes;
            const usePercent = sizeBytes > 0 ? ((usedBytes / sizeBytes) * 100).toFixed(1) + '%' : '0%';

            const usage: DiskUsageInfo = {
                filesystem: `/dev/${disk.name}`,
                size: (sizeBytes / (1024 ** 3)).toFixed(2) + 'G',
                used: (usedBytes / (1024 ** 3)).toFixed(2) + 'G',
                avail: (availBytes / (1024 ** 3)).toFixed(2) + 'G',
                usePercent,
            };
            return usage || null;
        } catch (error) {
            throw new Error("could_not_fetch_disk_usage_by_disk");
        }
    }

    function getUsedBytes(children: BlockDevice[]): number {
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