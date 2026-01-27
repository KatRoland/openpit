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