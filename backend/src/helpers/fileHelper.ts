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

export async function folderContents(folderPath: string): Promise<{ name: string; type: string, path: string }[]> {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    return entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: folderPath + '/' + entry.name
    }));
  } catch (err) {
    console.error("Error reading directory:", err);
    return [];
  }
}