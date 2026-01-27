import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
const execAsync = promisify(exec);

export async function isFolderExists(folderPath: string): Promise<boolean> {
    try {
        await fs.access(folderPath);
        return true;
    } catch {
        return false;
    }
}