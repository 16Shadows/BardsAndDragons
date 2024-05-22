import { Readable } from "stream";
import { IMimeTypeConverter, MimeTypeConverter, MimeTypeParams } from "./mimeTypeConverter";
import { constructor } from "../types";
import { streamToBuffer } from "./utils";
import iconv from 'iconv-lite';
import { pipeline } from 'stream';

module DefaultMimeTypeConverters {
    @MimeTypeConverter('application/json')
    export class JsonMimeTypeConverter implements IMimeTypeConverter {
        async convertFrom(input: Readable, params?: MimeTypeParams): Promise<any> {
            var encoding: string = params?.['charset'] ?? 'utf-8';
            if (encoding == 'utf-8')
                return JSON.parse((await streamToBuffer(input)).toString('utf-8'));
            else
                return JSON.parse((await streamToBuffer(pipeline(input, iconv.decodeStream(encoding), () => {}))).toString());
        }

        async convertTo(value: any, params?: MimeTypeParams): Promise<NodeJS.ReadableStream> {
            var stream: Readable = new Readable();
            stream.push(JSON.stringify(value));
            stream.push(null);
            var encoding: string = params?.['charset'] ?? 'utf-8';
            if (encoding == 'utf-8')
                return stream;
            else
                return pipeline(stream, iconv.encodeStream(encoding), () => {});
        }
        
    }

    @MimeTypeConverter('text/plain')
    export class PlainTextMimeTypeConverter implements IMimeTypeConverter {
        async convertFrom(input: NodeJS.ReadableStream, params?: MimeTypeParams): Promise<any> {
            var encoding: string = params?.['charset'] ?? 'utf-8';
            if (encoding == 'utf-8')
                return (await streamToBuffer(input)).toString('utf-8');
            else
                return (await streamToBuffer(pipeline(input, iconv.decodeStream(encoding))), () => {}).toString();
        }

        async convertTo(value: any, params?: MimeTypeParams): Promise<NodeJS.ReadableStream> {
            var stream: Readable = new Readable();
            stream.push(value?.toString() ?? '');
            stream.push(null);
            var encoding: string = params?.['charset'] ?? 'utf-8';
            if (encoding == 'utf-8')
                return stream;
            else
                return pipeline(stream, iconv.encodeStream(encoding), () => {});
        }
        
    }

    export function getDefaultMimeTypes(): Iterable<constructor<IMimeTypeConverter>> {
        return [ JsonMimeTypeConverter, PlainTextMimeTypeConverter ];
    }
};

export = DefaultMimeTypeConverters;