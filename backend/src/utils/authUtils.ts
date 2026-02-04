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
        await execSudo(`usermod -aG users ${sanitizedUsername}`);

    } catch (error) {
        console.error(`Failed to create Linux user ${sanitizedUsername}:`, error);
        throw error;
    }
}

export async function changeUserGroups(username: string, groups: {groupsToAdd: string[], groupsToRemove: string[]}): Promise<void> {
    const sanitizedUsername = sanitizeString(username);

    if(!await isSystemUserExists(sanitizedUsername)) {
        throw new Error("user_does_not_exist");
    }

    try {
        if (groups.groupsToAdd.length > 0) {
            const groupsToAddStr = groups.groupsToAdd.map(sanitizeString).join(',');
            await execSudo(`usermod -aG ${groupsToAddStr} ${sanitizedUsername}`);
        }

        if (groups.groupsToRemove.length > 0) {
            for (const group of groups.groupsToRemove) {
                const sanitizedGroup = sanitizeString(group);
                await execSudo(`gpasswd -d ${sanitizedUsername} ${sanitizedGroup}`);
            }
        }

    } catch (error: any) {
        if(error.message.includes("is not a member of")) {
            throw new Error("user_not_in_group");
        } else if (error.message.includes("does not exist")) {
            throw new Error("group_does_not_exist");
        } else {
        console.error(`Failed to change groups for user ${sanitizedUsername}:`, error);
        throw error;
        }
    }   
}

export async function deleteSystemUser(username: string): Promise<void> {
    const sanitizedUsername = sanitizeString(username);

    try {
        if (!await isSystemUserExists(sanitizedUsername)) {
            throw new Error("user_does_not_exist");
        }

        await execSudo(`smbpasswd -x ${sanitizedUsername}`);
        await execSudo(`userdel -r ${sanitizedUsername}`);

    } catch (error) {
        console.error(`Failed to delete Linux user ${sanitizedUsername}:`, error);
        throw error;
    }
}

export async function changeUserPassword(username: string, newPassword: string): Promise<void> {
    const sanitizedUsername = sanitizeString(username);

    try {
        if (!await isSystemUserExists(sanitizedUsername)) {
            throw new Error("user_does_not_exist");
        }

        const { stdout } = await execAsync(`openssl passwd -6 \"${newPassword}\"`);
        const hashedPassword = stdout.trim();
        await execSudo(`usermod -p '${hashedPassword}' ${sanitizedUsername}`);
        await createPasswordForSambaUser(sanitizedUsername, newPassword);

    } catch (error) {
        console.error(`Failed to change password for user ${sanitizedUsername}:`, error);
        throw error;
    }
}