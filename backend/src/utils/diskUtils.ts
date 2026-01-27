import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { BlockDevice, DiskUsageInfo, ChildrenStatus } from '../types/disk.js';
import { getUsedBytes, mountableFileSystemsHelper, isFsMounted, isFsExists } from '../helpers/diskHelper.js';
import { sanitizeString } from '@/helpers/stringHelper.js';

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
            const sanitizedName = sanitizeString(diskName);
            const blocks = await execAsync(`lsblk -bJ -o NAME,SIZE,FSUSED /dev/${sanitizedName}`);
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

    export async function initDisk(disk: string, username: string): Promise<{ statusCode: number; message: string }> {
        const sanitizedDisk = sanitizeString(disk);
        const devicePath = `/dev/${sanitizedDisk}`;
        const partitionPath = `${devicePath}1`; 
        const mountPoint = `/mnt/${sanitizedDisk}1`;

        if (!await isFsExists(sanitizedDisk)) {
            throw new Error("disk_not_found");
        }

        if (await isFsMounted(`${sanitizedDisk}1`)) {
            throw new Error("unmount_first");
        }

        try {
            await execSudo(`parted ${devicePath} mklabel gpt --script`);

            await execSudo(`parted -a optimal ${devicePath} mkpart primary ext4 0% 100% --script`);
            
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for partition to be recognized -- DONT REMOVE --

            await execSudo(`mkfs.ext4 ${partitionPath}`);

            const { stdout: uuidRaw } = await execAsync(`sudo -n blkid -s UUID -o value ${partitionPath}`);
            const uuid = uuidRaw.trim();
            if (!uuid) throw new Error("uuid_generation_failed");

            const fstabEntry = `UUID=${uuid} ${mountPoint} ext4 defaults,nofail 0 2`;
            await execSudo(`sed -i '\\|${mountPoint}|d' /etc/fstab`);
            await execSudo(`bash -c 'echo "${fstabEntry}" >> /etc/fstab'`);

            await execSudo(`mkdir -p ${mountPoint}`);
            await execSudo(`mount -a`);
            await execSudo(`chown -R nobody:nogroup ${mountPoint}`);

            return { statusCode: 200, message: "initialization_successful" };

        } catch (error) {
            console.error(`Disk initialization failed:`, error);
            throw new Error("disk_initialization_failed");
        }
    }

    export async function diskStatus(disk: string): Promise<ChildrenStatus[]> {
        const sanitizedDisk = sanitizeString(disk);

        if(!await isFsExists(disk)) {
            throw new Error("disk_not_found");
        }

        const { stdout } = await execAsync(`lsblk -J -o NAME,FSTYPE,MOUNTPOINT /dev/${sanitizedDisk}`);
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

    async function getALLDiskIOStats(): Promise<any[]> {
        try {
            const { stdout } = await execAsync(`iostat -dk -o JSON 1 1`);
            const data = JSON.parse(stdout);
            const diskStats = data.sysstat.hosts[0].statistics[0].disk;

            const filtered = diskStats.map((d: any) => ({
                device: d.disk_device,
                read_kB_s: d['kB_read/s'],
                write_kB_s: d['kB_wrtn/s'],
            }));
            return filtered;
        }
            catch (error) {
            console.error(`Error fetching all disk I/O stats:`, error);
            throw new Error("could_not_fetch_all_disk_io_stats");
        }
    }

    export async function getDiskIOStats(disk: string): Promise<{ readBytes: number; writeBytes: number }> {
        try {
            const allStats = await getALLDiskIOStats();

            const targetDisk = allStats.find((d: any) => d.device === disk);

            if (!targetDisk) {
                throw new Error("disk_not_found");
            }

            return {
                readBytes: targetDisk.read_kB_s * 1024,
                writeBytes: targetDisk.write_kB_s * 1024,
            };

        } catch (error) {
            console.error(`Error fetching disk I/O stats for ${disk}:`, error);
            throw new Error("could_not_fetch_disk_io_stats");
        }
    }