import { ExtendedReturn, HTTPResponse, OutgoingHttpHeaders } from "./core";

module Response {
    export function convert(body: any, mimeType: string, code: number = 200, headers?: OutgoingHttpHeaders): ExtendedReturn {
        if (headers == undefined)
            headers = {};

        headers['Content-Type'] = mimeType;
        return new ExtendedReturn(code, headers, body, mimeType);
    }

    export function json(body: any, code: number = 200, headers?: OutgoingHttpHeaders): ExtendedReturn {
        return convert(body, 'application/json', code, headers);
    }

    export function text(body: any, code: number = 200, headers?: OutgoingHttpHeaders): ExtendedReturn {
        return convert(body, 'text/plain', code, headers);
    }

    export function auto(body: any, code: number = 200, headers?: OutgoingHttpHeaders): ExtendedReturn {
        return new ExtendedReturn(code, headers, body);
    }

    export function status(code: number = 200, headers?: OutgoingHttpHeaders): HTTPResponse {
        return new HTTPResponse(code, headers);
    }

    export function badRequest(body: any): ExtendedReturn {
        return auto(body, 400);
    }

    export function unauthorized(body: any): ExtendedReturn {
        return auto(body, 401);
    }
    
    export function forbidden(body: any): ExtendedReturn {
        return auto(body, 403);
    }

    export function notFound(body: any): ExtendedReturn {
        return auto(body, 404);
    }

    export function conflict(body: any): ExtendedReturn {
        return auto(body, 409);
    }
}

export = Response;