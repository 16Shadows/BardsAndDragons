import { IMiddleware, MiddlewareContext } from "../modules/core/middleware/middleware";
import { HTTPResponse } from "../modules/core/routing/core";

export type ExampleMiddlewareBag = {
    'test': number;
}

export class ExampleMiddleware implements IMiddleware {
    async run(ctx: MiddlewareContext, bag: ExampleMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        bag['test'] = 5;
        return undefined;
    }
}