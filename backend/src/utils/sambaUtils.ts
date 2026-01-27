import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { BlockDevice, DiskUsageInfo, ChildrenStatus } from '../types/disk.js';
import { isFolderExists } from '../helpers/fileHelper.js';
import { initializeSambaGlobal } from '@/helpers/sambaHelper.js';

const execAsync = promisify(exec);

export async function shareFolder(mountPoint: string, sharedName: string): Promise< {statusCode: number, message: string} > {

    const folderExists = await isFolderExists(mountPoint);
    if (!folderExists) {
        return { statusCode: 400, message: 'folder_does_not_exist' };
    }

    await initializeSambaGlobal();

    const registryFile = '/etc/samba/shares.conf';
    const shareName = sharedName.replace(/\//g, '_').replace(/^_/, '');

    const newShareConfig = `
[${shareName}]
    path = ${mountPoint}
    browseable = yes
    read only = no
    guest ok = yes
    force user = nobody
    force group = nogroup
`;

    try {
        const { stdout: currentRegistry } = await execAsync(`cat ${registryFile}`).catch(() => ({ stdout: '' }));
        
        if (currentRegistry.includes(`[${shareName}]`)) {
            console.log("Share already exists, skipping...");
            return { statusCode: 200, message: 'folder_already_shared' };
        }

        const base64Config = Buffer.from(newShareConfig).toString('base64');
        await execSudo(`bash -c 'echo "${base64Config}" | base64 -d >> ${registryFile}'`);

        await execSudo('systemctl reload smbd');
        await execSudo('chmod -R 0777 ' + mountPoint);
        await execSudo(`chown -R nobody:nogroup ${mountPoint}`);
        console.log(`Folder ${mountPoint} shared successfully as ${shareName}`);
        return { statusCode: 200, message: 'folder_shared_successfully' };
    } catch (error) {
        console.error("Failed to update Samba registry:", error);
        throw error;
    }
}
