import crypto from 'crypto';

export function hash(stream: NodeJS.ReadableStream, algorithm?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const hasher = crypto.createHash(algorithm ?? 'sha1').setEncoding('hex');
    
        stream.once('error', reject).once('end', () => {
            hasher.end();
            resolve(hasher.read());
            hasher.destroy();
        });

        stream.pipe(hasher);
    });
}