import { IMiddleware, MiddlewareBag, MiddlewareContext } from "../core/middleware/middleware";
import { HTTPResponse } from "../core/routing/core";

module SSEMiddleware {
    export type LastEventIDBag = {
        lastEventID?: string;
    }

    export class ParseLastEventID implements IMiddleware {
        async run(ctx: MiddlewareContext, bag: LastEventIDBag): Promise<MiddlewareContext | HTTPResponse> {
            if (typeof ctx.headers['last-event-id'] == 'string')
                bag.lastEventID = ctx.headers['last-event-id'];
            else
                bag.lastEventID = ctx.headers['last-event-id']?.[0];

            return undefined;
        }
    }
}

export = SSEMiddleware;