import { IMimeTypeConverter, MimeTypeConverter, MimeTypeParams } from "../modules/core/mimeType/mimeTypeConverter";

@MimeTypeConverter('image/png')
export class PngMimeTypeConverter implements IMimeTypeConverter {
    async convertFrom(input: NodeJS.ReadableStream, params?: MimeTypeParams): Promise<any> {
        return input;
    }

    async convertTo(value: any, params?: MimeTypeParams): Promise<NodeJS.ReadableStream> {
        return value;
    }
}

@MimeTypeConverter('image/jpeg')
export class JpegMimeTypeConverter implements IMimeTypeConverter {
    async convertFrom(input: NodeJS.ReadableStream, params?: MimeTypeParams): Promise<any> {
        return input;
    }

    async convertTo(value: any, params?: MimeTypeParams): Promise<NodeJS.ReadableStream> {
        return value;
    }
}