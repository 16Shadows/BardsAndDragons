import fs from 'fs';
import fsPromise from 'fs/promises';
import {Readable} from 'stream';

export async function compareFiles(file1: string, file2: string): Promise<boolean> {
    //Check for undefined
    if (!file1 || !file2)
        return false;

    //Get stats of both file (will throw if the file doesn't exist)
    try {
        var stat1 = await fsPromise.stat(file1);
        var stat2 = await fsPromise.stat(file2);
    }
    catch {
        return false;
    }

    //Compare sizes
    if (stat1.size != stat2.size)
        return false;

    var file1Stream = fs.createReadStream(file1);
    var file2Stream = fs.createReadStream(file2);
    var result = await compareStreams(file1Stream, file2Stream);
    file1Stream.destroy();
    file2Stream.destroy();
    return result;
}

function waitForData(stream: Readable): Promise<void> {
    return new Promise((resolve, reject) => {
        function onReadable() {
            detach();
            resolve();
        }

        function onError(err: Error) {
            detach();
            reject(err);
        }

        function detach() {
            stream.removeListener('readable', onReadable);
            stream.removeListener('end', onReadable);
            stream.removeListener('error', onError);
        }

        stream.once('error', onError).once('readable', onReadable).once('end', onReadable);
    });
}

function readStream(stream: Readable, length?: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
        var lastIterLength = 0;
        while (true) {
            var value = stream.read(length);
            
            if (value || stream.readableEnded)
                return resolve(value);

            //fs.ReadStream is weird and doesn't seem to follow the convention of read returning all remaining data if the stream has ended
            //(maybe it doesn't end the stream properly when out of data in the file?)
            //if after 'readable' event the stream's internal buffer's size doesn't change, we assume that that there is no more data beyond that point
            if (lastIterLength == stream.readableLength)
            {
                value = stream.read(stream.readableLength);
                if (value || stream.readableEnded)
                    return resolve(value);
            }
            lastIterLength = stream.readableLength;

            if (stream.errored)
                return reject(stream.errored);

            try {
                await waitForData(stream);
            }
            catch(err) {
                reject(err);
            }
        }
    });
}

export type ObjectModeStreamCompareOptions = {
    objectModeComparer: (left: any, right: any) => boolean;
}

export type DataModeStreamCompareOptions = {
    bufferSize: number;
};

export async function compareStreams(left: Readable, right: Readable, options?:  Partial<DataModeStreamCompareOptions> & Partial<ObjectModeStreamCompareOptions>): Promise<boolean> {
    if (!left || !right)
        return false;

    if (left.readableObjectMode != right.readableObjectMode)
        throw new Error('Comparing streams in different mode!');

    if (left.readableObjectMode)
    {
        return compareStreamObjectMode(left, right, {
            objectModeComparer: options?.objectModeComparer ?? Object.is
        });
    }
    else {
        var dataModeOptions: DataModeStreamCompareOptions = {
            //We either use the smallest of specified/default buffer size or highwatermarks of the streams
            //Doing read() with value greater than highWaterMark will yield null and stream reading will fail
            bufferSize: Math.min(Math.trunc(options?.bufferSize ?? 4096), left.readableHighWaterMark, right.readableHighWaterMark)
        }

        if (dataModeOptions.bufferSize < 1)
            throw new Error(`Buffer size must be greater than 0 (current: ${dataModeOptions.bufferSize}).`);

        return compareStreamDataMode(left, right, dataModeOptions);
    }
}

function compareStreamObjectMode(left: Readable, right: Readable, options: ObjectModeStreamCompareOptions): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            while(true) {
                var leftObject = await readStream(left);
                var rightObject = await readStream(right);

                if (leftObject == null || rightObject == null)
                    return resolve(rightObject == leftObject);

                if (!options.objectModeComparer(leftObject, rightObject))
                    return resolve(false);
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

function compareStreamDataMode(left: Readable, right: Readable, options: DataModeStreamCompareOptions): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            while(true) {
                var leftBuffer = await readStream(left, options.bufferSize) as Buffer | string;
                var rightBuffer = await readStream(right, options.bufferSize) as Buffer | string;

                if (leftBuffer == null || rightBuffer == null)
                    return resolve(leftBuffer == rightBuffer);
                
                if (typeof leftBuffer == 'string')
                    leftBuffer = Buffer.from(leftBuffer, left.readableEncoding);

                if (typeof rightBuffer == 'string')
                    rightBuffer = Buffer.from(rightBuffer, right.readableEncoding);

                if (!leftBuffer.equals(rightBuffer))
                    return resolve(false);
            }
        }
        catch(err) {
            reject(err);
        }
    });
}