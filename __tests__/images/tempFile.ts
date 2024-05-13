import { getTempFileName } from "../../src/images/tempFile";
import fs from 'fs/promises';

test('Temp file test', async () => {
    var file = await getTempFileName();
    
    await fs.writeFile(file, 'test');
    expect((await fs.readFile(file)).toString('utf-8')).toBe('test');
    await fs.rm(file);
});