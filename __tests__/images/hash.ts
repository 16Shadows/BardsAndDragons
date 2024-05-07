import { hash } from "../../src/images/hash";
import { getTempFileName } from "../../src/images/tempFile";
import fs from 'fs/promises';
import oldfs from 'fs';

test('hash test', async () => {
    var file = await getTempFileName();
    
    await fs.writeFile(file, 'test');
    
    const readStream = oldfs.createReadStream(file);
    const hsh = await hash(readStream, 'sha1');
    readStream.destroy();
    expect(hsh).toMatch('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3');
});