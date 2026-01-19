import { exec } from 'child_process';
import { promisify } from 'util';
import { BlockDevice, DiskUsageInfo, ChildrenStatus } from '../types/disk.js';
import { getUsedBytes, mountableFileSystemsHelper, isFsMounted, isFsExists } from '../helpers/diskHelper.js';

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

    export async function initDisk(disk: string): Promise<{ statusCode: number; message: string }> {
        if (!await isFsExists(disk)) {
            throw new Error("disk_not_found");
        }
        try {
        if (await isFsMounted(disk)) {
            await execAsync(`sudo -n umount /dev/${disk}1`);
            await execAsync(`sudo -n parted /dev/${disk} rm 1 --script`);
        }
        await execAsync(`sudo -n parted /dev/${disk} mklabel gpt --script`);
        await execAsync(`sudo -n parted -a optimal /dev/${disk} mkpart primary ext4 0% 100% --script`);
        console.log("Partition created");
        await execAsync(`sudo -n mkfs.ext4 /dev/${disk}1`);
        await execAsync(`sudo -n mkdir -p /mnt/${disk}`);
        await execAsync(`sudo -n mount /dev/${disk}1 /mnt/${disk}`);
        } catch (error) {
            console.error("Disk initialization error:", error);
            throw new Error("disk_initialization_failed");
        }
        return { statusCode: 200, message: "initialization_successful" };
    } 

    export async function diskStatus(disk: string): Promise<ChildrenStatus[]> {
        
        if(!await isFsExists(disk)) {
            throw new Error("disk_not_found");
        }
        
        const { stdout } = await execAsync(`lsblk -J -o NAME,FSTYPE,MOUNTPOINT /dev/${disk}`);
        const parsed = JSON.parse(stdout);
        console.log(parsed);
        if(parsed.blockdevices[0].children.length === 0) {
            return [{ name: disk, status: "unmounted", fileSystem: "unknown" }];
        }
        const childrens = [] as ChildrenStatus[];
        for (const child of parsed.blockdevices[0].children) {
            const name = child.name;
            const ismounted = child.mountpoint !== null;
            const fileSystem = child.fstype || "unknown";
            childrens.push({ name, status: ismounted ? "mounted" : "unmounted", fileSystem });
        }
        return childrens;
    }

    export async function mountableFileSystems(): Promise<BlockDevice[]> {
        const allDisks = await getDiskList();
        const mountables = [];
        for (const disk of allDisks) {
            if(disk.children && disk.children.length > 0) {
                for (const child of disk.children) {
                    mountables.push(...await mountableFileSystemsHelper(child));
                }
            }
            if (!disk.mountpoint && disk.fstype !== null) {
                mountables.push(disk);
            }
        }
        return mountables;
    }
