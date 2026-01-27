import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { BlockDevice, DiskUsageInfo, ChildrenStatus } from '../types/disk.js';
import { getUsedBytes, mountableFileSystemsHelper, isFsMounted, isFsExists } from '../helpers/diskHelper.js';
import { getDiskList } from './diskUtils.js';

const execAsync = promisify(exec);

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

    export async function mountFileSystem(fileSystem: string): Promise<{ statusCode: number; message: string }> {
        const devicePath = `/dev/${fileSystem}`;
        const partitionPath = `${devicePath}`;
        const mountPoint = `/mnt/${fileSystem}`;

        if (!await isFsExists(fileSystem)) {
            throw new Error("device_not_found");
        }

        if( await isFsMounted(fileSystem)) {
            throw new Error("already_mounted");
        }

        try {
            const { stdout: uuidRaw } = await execAsync(`sudo -n blkid -s UUID -o value ${partitionPath}`);
            const uuid = uuidRaw.trim();

            if (!uuid) {
                throw new Error("not_a_valid_filesystem");
            }

            const fstabEntry = `UUID=${uuid} ${mountPoint} ext4 defaults,nofail 0 2`;
            await execSudo(`sed -i '\\|${mountPoint}|d' /etc/fstab`);
            await execSudo(`bash -c 'echo "${fstabEntry}" >> /etc/fstab'`);
            await execSudo(`mkdir -p ${mountPoint}`);
            await execSudo(`mount -a`);
            await execSudo(`chown -R nobody:nogroup ${mountPoint}`);
            await execSudo('chmod -R 777 ' + mountPoint);

            return { statusCode: 200, message: "mount_successful" };

        } catch (error) {
            console.error(`Failed to mount and persist ${fileSystem}:`, error);
            throw new Error("mount_faiiled");
        }
    }

        export async function unmountFileSystem(fileSystem: string): Promise<{ statusCode: number; message: string }> {
        const mountPoint = `/mnt/${fileSystem}`;

        try {
            if (!await isFsExists(fileSystem)) {
                throw new Error("device_not_found");
            }
        } catch (error) {
            throw new Error("device_not_found");
        }


        try {
            if(!await isFsMounted(`${fileSystem}`)) {
                throw new Error("not_mounted");
            }

            await execSudo(`umount ${mountPoint}`);

            await execSudo(`sed -i '\\|${mountPoint}|d' /etc/fstab`);

            await execSudo(`rmdir ${mountPoint}`);

            return { statusCode: 200, message: "unmount_successful" };

        } catch (error: any) {
            if (error.message?.includes("target is busy")) {
                throw new Error("disk_busy");
            } else if( error.message === "not_mounted") {
                throw new Error("not_mounted");
            }
            
            console.error(`Failed to unmount`, error);
            throw new Error("unmount_failed");
        }
    }

    export async function formatFileSystem(fileSystem: string): Promise<{ statusCode: number; message: string }> {
        const devicePath = `/dev/${fileSystem}`;
        const partitionPath = `${devicePath}`;

        if (!await isFsExists(fileSystem)) {
            throw new Error("device_not_found");
        }

        var isMounted = await isFsMounted(fileSystem);
        if (isMounted) {
            throw new Error("unmount_first");            
        }
        try {
            await execSudo(`mkfs.ext4 ${partitionPath}`);
            return { statusCode: 200, message: "format_successful" };
        } catch (error: any) {
            if(error.message?.includes("already mounted")) {
                throw new Error("unmount_first");
                }
            console.error(`Failed to format`, error);
            throw new Error("format_failed");
        }
    }

    export async function deleteFileSystem(disk: string, partition: number): Promise<{ statusCode: number; message: string }> {
        const fileSystem = `${disk}${partition}`;
        const mountPoint = `/mnt/${fileSystem}`;

        if (!await isFsExists(fileSystem)) {
            throw new Error("device_not_found");
        }

        var isMounted = await isFsMounted(fileSystem);
        if (isMounted) {
            throw new Error("unmount_first");
        }

        try {
            await execSudo(`sed -i '\\|${mountPoint}|d' /etc/fstab`);
            await execSudo(`mount -a`);
            await execSudo(`parted /dev/${disk} rm ${partition} --script`);
            return { statusCode: 200, message: "deletion_successful" };
        } catch (error: any) {
            if(error.message?.includes("already mounted")) {
                throw new Error("unmount_first");
                }
            console.error(`Failed to delete filesystem`, error);
            throw new Error("deletion_failed");
        }
    }