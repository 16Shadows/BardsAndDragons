import { Readable } from 'stream';
import { compareFiles, compareStreams } from '../../src/images/fileCompare';
import { getTempFileName } from '../../src/images/tempFile';
import fsPromise from 'fs/promises';

test('streamCompare object mode similar streams', async () => {
    var stream1 = new Readable({ read: () => {}, objectMode: true });
    var stream2 = new Readable({ read: () => {}, objectMode: true });

    stream1.push('test');
    stream1.push(5);
    stream1.push(null);

    stream2.push('test');
    stream2.push(5);
    stream2.push(null);

    expect(await compareStreams(stream1, stream2)).toBe(true);
});

test('streamCompare object mode different streams', async () => {
    var stream1 = new Readable({ read: () => {}, objectMode: true });
    var stream2 = new Readable({ read: () => {}, objectMode: true });

    stream1.push('test');
    stream1.push(5);
    stream1.push(null);

    stream2.push('test');
    stream2.push(2);
    stream2.push(null);

    expect(await compareStreams(stream1, stream2)).toBe(false);
    stream1.destroy();
    stream2.destroy();
});

test('streamCompare object mode custom comparator', async () => {
    var stream1 = new Readable({ read: () => {}, objectMode: true });
    var stream2 = new Readable({ read: () => {}, objectMode: true });

    stream1.push('test');
    stream1.push({test:5});
    stream1.push(null);

    stream2.push('test');
    stream2.push({test:5});
    stream2.push(null);

    expect(await compareStreams(stream1, stream2, { objectModeComparer(left, right) {
        return JSON.stringify(left) == JSON.stringify(right);
    }, })).toBe(true);
});

test('streamCompare data mode same streams', async () => {
    var stream1 = new Readable({ read: () => {} });
    var stream2 = new Readable({ read: () => {} });

    stream1.push('test');
    stream1.push('v22');
    stream1.push(null);

    stream2.push('test');
    stream2.push('v22');
    stream2.push(null);

    expect(await compareStreams(stream1, stream2)).toBe(true);
});

test('streamCompare data mode different streams', async () => {
    var stream1 = new Readable({ read: () => {} });
    var stream2 = new Readable({ read: () => {} });

    stream1.push('test');
    stream1.push('v22');
    stream1.push(null);

    stream2.push('test');
    stream2.push('v25');
    stream2.push(null);

    expect(await compareStreams(stream1, stream2)).toBe(false);
});

test('streamCompare data mode streams different encodings', async () => {
    var stream1 = new Readable({ read: () => {}, encoding: 'base64' });
    var stream2 = new Readable({ read: () => {} });

    stream1.push('test');
    stream1.push('v22');
    stream1.push(null);

    stream2.push('test');
    stream2.push('v22');
    stream2.push(null);

    expect(await compareStreams(stream1, stream2)).toBe(true);
});

test('fileCompare same file', async () => {
    var tempFile1 = await getTempFileName();
    var tempFile2 = await getTempFileName();

    await fsPromise.writeFile(tempFile1, 'testData');
    await fsPromise.writeFile(tempFile2, 'testData');

    expect(await compareFiles(tempFile1, tempFile2)).toBe(true);

    await fsPromise.rm(tempFile1);
    await fsPromise.rm(tempFile2);
});

test('fileCompare different file', async () => {
    var tempFile1 = await getTempFileName();
    var tempFile2 = await getTempFileName();

    await fsPromise.writeFile(tempFile1, 'testData22');
    await fsPromise.writeFile(tempFile2, 'testData');

    expect(await compareFiles(tempFile1, tempFile2)).toBe(false);

    await fsPromise.rm(tempFile1);
    await fsPromise.rm(tempFile2);
});