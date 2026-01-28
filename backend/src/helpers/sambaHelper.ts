import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
import { execSudo } from '../helpers/execHelper.js';

export async function initializeSambaGlobal(): Promise<void> {
    const smbConf = '/etc/samba/smb.conf';
    const registryFile = '/etc/samba/shares.conf';
    const includeLine = `include = ${registryFile}`;

    try {
        const { stdout } = await execAsync(`grep -F "${includeLine}" ${smbConf}`).catch(() => ({ stdout: '' }));

        if (!stdout) {
            await execSudo(`touch ${registryFile} && chmod 644 ${registryFile}`);
            const sedCommand = `sed -i '/\\[global\\]/a \\   ${includeLine}' ${smbConf}`;
            await execSudo(sedCommand);
            
            await execSudo('systemctl reload smbd');
        }
    } catch (error) {
        console.error("Failed to initialize Samba global config:", error);
        throw error;
    }
}

export async function sharedFoldersByPartition(partitionPath: string): Promise<{name: string, path: string}[]> {
    const registryFile = '/etc/samba/shares.conf';
    const shares: {name: string, path: string} []= [];

    try {
        const { stdout: currentRegistry } = await execAsync(`cat ${registryFile}`).catch(() => ({ stdout: '' }));
        const shareBlocks = currentRegistry.split(/\n\s*\n/);

        for (const block of shareBlocks) {
            const nameMatch = block.match(/\[(.+?)\]/);
            const pathMatch = block.match(/path\s*=\s*(.+)/);
            if (nameMatch && pathMatch) {
                const sharePath = pathMatch[1].trim();
                if (sharePath.includes(partitionPath)) {
                    shares.push({ name: nameMatch[1].trim(), path: sharePath });
                }
            }
        }

        return shares;
    } catch (error) {
        console.error("Failed to list Samba shares by partition:", error);
        throw error;
    }
}

export async function createPasswordForSambaUser(username: string, password: string): Promise<void> {
    try {
        const command = `sh -c 'printf "${password}\\n${password}\\n" | smbpasswd -s -a ${username}'`;
        await execSudo(command);
    } catch (error) {
        console.error("Failed to create Samba user password:", error);
        throw error;
    }
}