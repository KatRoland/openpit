import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function execSudo(command: string) {
    return execAsync(`sudo -n ${command}`);
}