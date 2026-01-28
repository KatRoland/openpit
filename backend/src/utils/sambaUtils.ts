import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { BlockDevice, DiskUsageInfo, ChildrenStatus } from '../types/disk.js';
import { isFolderExists } from '../helpers/fileHelper.js';
import { initializeSambaGlobal } from '@/helpers/sambaHelper.js';
import { sanitizeString } from '@/helpers/stringHelper.js';
import { string } from 'zod/index.cjs';

const execAsync = promisify(exec);

export async function shareFolder(mountPoint: string, sharedName: string): Promise< {statusCode: number, message: string} > {

    const folderExists = await isFolderExists(mountPoint);
    if (!folderExists) {
        return { statusCode: 400, message: 'folder_does_not_exist' };
    }

    
    
    await initializeSambaGlobal();
    
    const registryFile = '/etc/samba/shares.conf';
    const shareName = sharedName.replace(/\//g, '_').replace(/^_/, '');
    const sanitizedName = sanitizeString(shareName);

    const newShareConfig = `
[${sanitizedName}]
    path = ${mountPoint}
    browseable = yes
    read only = no
    guest ok = yes
    force user = nobody
    force group = nogroup
`;

    try {
        const { stdout: currentRegistry } = await execAsync(`cat ${registryFile}`).catch(() => ({ stdout: '' }));
        
        if (currentRegistry.includes(`[${sanitizedName}]`)) {
            console.log("Share already exists, skipping...");
            return { statusCode: 200, message: 'folder_already_shared' };
        }

        const base64Config = Buffer.from(newShareConfig).toString('base64');
        await execSudo(`bash -c 'echo "${base64Config}" | base64 -d >> ${registryFile}'`);

        await execSudo('systemctl reload smbd');
        await execSudo('chmod -R 0777 ' + mountPoint);
        await execSudo(`chown -R nobody:nogroup ${mountPoint}`);
        console.log(`Folder ${mountPoint} shared successfully as ${sanitizedName}`);
        return { statusCode: 200, message: 'folder_shared_successfully' };
    } catch (error) {
        console.error("Failed to update Samba registry:", error);
        throw error;
    }
}

export async function unshareFolder(shareName: string): Promise< {statusCode: number, message: string} > {
    const registryFile = '/etc/samba/shares.conf';

    if (!isFolderExists(registryFile)) {
        return { statusCode: 404, message: 'samba_config_not_initialized' };
    }

    try {
        const sanitizedName = sanitizeString(shareName);
        const { stdout: currentRegistry } = await execAsync(`cat ${registryFile}`).catch(() => ({ stdout: '' }));
        
        if (!currentRegistry.includes(`[${sanitizedName}]`)) {
            return { statusCode: 404, message: 'share_not_found' };
        }

        const sedCommand = `sed -i '/\\[${sanitizedName}\\]/,/^$/d' ${registryFile}`;
        await execSudo(sedCommand);

        await execSudo('systemctl reload smbd');
        console.log(`Share ${sanitizedName} removed successfully`);
        return { statusCode: 200, message: 'share_removed_successfully' };
    } catch (error) {
        console.error("Failed to remove Samba share:", error);
        throw error;
    }

}

export async function createNewShare(shareName: string, mountPoint: string): Promise<{statusCode: number, message: string}> {
    if(!await isFolderExists(mountPoint)) {
        throw new Error("mount_point_not_found");
    }

    if(!await isFolderExists(`${mountPoint}/shared`)) {
        await execSudo(`mkdir -p ${mountPoint}/shared`);
    }

    try {
        const result = await shareFolder(`${mountPoint}/shared`, shareName);
        if(result.statusCode !== 200) {
            throw new Error(result.message);
        }
        return { statusCode: 200, message: 'share_created_successfully' };
    } catch (error) {
        console.error("Failed to create new Samba share:", error);
        throw error;
    }
}

export async function listSharedFolders(): Promise< {name: string, path: string} []> {
    const registryFile = '/etc/samba/shares.conf';
    const shares: {name: string, path: string} []= [];

    try {
        const { stdout: currentRegistry } = await execAsync(`cat ${registryFile}`).catch(() => ({ stdout: '' }));
        const lines = currentRegistry.split('\n');

        let currentShare: {name: string, path: string} | null = null;

        for (const line of lines) {
            const shareMatch = line.match(/^\[(.+)\]$/);
            if (shareMatch) {
                if (currentShare) {
                    shares.push(currentShare);
                }
                currentShare = { name: shareMatch[1], path: '' };
            } else if (currentShare) {
                const pathMatch = line.match(/^\s*path\s*=\s*(.+)$/);
                if (pathMatch) {
                    currentShare.path = pathMatch[1];
                }
            }
        }

        if (currentShare) {
            shares.push(currentShare);
        }

        return shares;
    } catch (error) {
        console.error("Failed to list Samba shares:", error);
        throw error;
    }
}