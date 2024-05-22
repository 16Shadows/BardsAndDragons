import fsPromises from 'fs/promises';
import crypto from 'crypto';
import os from 'os';
import path from 'path';

export async function getTempFileName(timeoutMs?: number): Promise<string | undefined> {
    timeoutMs ??= Number.MAX_SAFE_INTEGER;
    
    const tempDir = os.tmpdir();
    var pth: string;
    
    var startTime = new Date();
    
    while (!pth && new Date().getTime() - startTime.getTime() < timeoutMs)
    {
        pth = path.join(tempDir, crypto.randomBytes(16).toString('hex'));
        try {
            await fsPromises.access(pth, fsPromises.constants.F_OK);
            pth = undefined;
        }
        catch {
            return pth;
        }
    }

    return undefined;
}