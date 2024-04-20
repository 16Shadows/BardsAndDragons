import { Readable } from 'stream';

module MimeTypeUtils {
    export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
        var chunks = [];

        for await (var chunk of stream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    };
}

export = MimeTypeUtils;