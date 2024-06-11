import { Readable } from 'stream';


module SSEStream {
    export type SSEMessage = {
        id?: string;
        data?: string;
        event?: string;
    };

    export class SSEStream extends Readable {
        constructor() {
            super({ read() {} });
        }

        pushMessage(message: SSEMessage) {
            if (message.id)
                this.push('id: ' + message.id + '\n', 'utf-8');

            if (message.event)
                this.push('event: ' + message.event + '\n', 'utf-8');

            for (var dataChunk of (message.data ?? '').split('\n'))
                this.push('data: ' + dataChunk + '\n', 'utf-8');

            this.push('\n', 'utf-8');
        }
    }
}

export = SSEStream;