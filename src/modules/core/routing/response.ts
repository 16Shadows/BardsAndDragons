import { HTTPResponseConvertBody, HTTPResponse, OutgoingHttpHeaders } from "./core";

module Response {
    export function convert(body: any, mimeType: string, code: number = 200, headers?: OutgoingHttpHeaders): HTTPResponseConvertBody {
        if (headers == undefined)
            headers = {};

        headers['Content-Type'] = mimeType;
        return new HTTPResponseConvertBody(code, headers, body, mimeType);
    }

    export function json(body: any, code: number = 200, headers?: OutgoingHttpHeaders): HTTPResponseConvertBody {
        return convert(body, 'application/json', code, headers);
    }

    export function text(body: any, code: number = 200, headers?: OutgoingHttpHeaders): HTTPResponseConvertBody {
        return convert(body, 'text/plain', code, headers);
    }

    export function auto(body: any, code: number = 200, headers?: OutgoingHttpHeaders): HTTPResponseConvertBody {
        return new HTTPResponseConvertBody(code, headers, body);
    }

    export function status(code: number = 200, headers?: OutgoingHttpHeaders): HTTPResponse {
        return new HTTPResponse(code, headers);
    }

    export function badRequest(body: any): HTTPResponseConvertBody {
        return auto(body, 400);
    }

    export function unauthorized(body: any): HTTPResponseConvertBody {
        return auto(body, 401);
    }
    
    export function forbidden(body: any): HTTPResponseConvertBody {
        return auto(body, 403);
    }

    export function notFound(body: any): HTTPResponseConvertBody {
        return auto(body, 404);
    }

    export function conflict(body: any): HTTPResponseConvertBody {
        return auto(body, 409);
    }
}

export = Response;