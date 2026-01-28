import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { sanitizeString } from '@/helpers/stringHelper.js';
import { createPasswordForSambaUser } from '@/helpers/sambaHelper.js';
import { isSystemUserExists } from '@/helpers/authHelpers.js';

const execAsync = promisify(exec);

export async function createSystemUser(username: string, password: string): Promise<void> {
    const sanitizedUsername = sanitizeString(username);

    try {
        if (await isSystemUserExists(sanitizedUsername)) {
            throw new Error("user_already_exists");
        }

        const { stdout } = await execAsync(`openssl passwd -6 \"${password}\"`);
        const hashedPassword = stdout.trim();
        console.log(`Creating user ${sanitizedUsername} with hashed password: ${hashedPassword}`);
        await execSudo(`useradd -m -s /bin/bash -p '${hashedPassword}' ${sanitizedUsername}`);
        await createPasswordForSambaUser(sanitizedUsername, password);

    } catch (error) {
        console.error(`Failed to create Linux user ${sanitizedUsername}:`, error);
        throw error;
    }
}

