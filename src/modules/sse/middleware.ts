import { IMiddleware, MiddlewareBag, MiddlewareContext } from "../core/middleware/middleware";
import { HTTPResponse } from "../core/routing/core";

module SSEMiddleware {
    export type SSEEndpointMiddlewareBag = {
        lastEventID?: string;
    }

    export class SSEEndpointMiddleware implements IMiddleware {
        async run(ctx: MiddlewareContext, bag: SSEEndpointMiddlewareBag): Promise<MiddlewareContext | HTTPResponse> {
            if (typeof ctx.headers['last-event-id'] == 'string')
                bag.lastEventID = ctx.headers['last-event-id'];
            else
                bag.lastEventID = ctx.headers['last-event-id']?.[0];

            ctx.res.socket.setKeepAlive(true);
            ctx.res.socket.setTimeout(0);
            ctx.res.socket.setNoDelay(true);
            ctx.res.setHeader('Connection', 'keep-alive');
            return undefined;
        }
    }
}

export = SSEMiddleware;