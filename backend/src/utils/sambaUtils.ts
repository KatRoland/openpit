import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { BlockDevice, DiskUsageInfo, ChildrenStatus } from '../types/disk.js';
import { isFolderExists } from '../helpers/fileHelper.js';
import { initializeSambaGlobal } from '@/helpers/sambaHelper.js';
import { sanitizeString } from '@/helpers/stringHelper.js';

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