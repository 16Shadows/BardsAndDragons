import {IMiddleware, MiddlewareContext} from "../modules/core/middleware/middleware";
import {HTTPResponse} from "../modules/core/routing/core";
import {verifyJwt} from "../utils/jwt";
import {UserPayload} from "../utils/UserPayload";

export type AuthMiddlewareBag = {
    userPayload: UserPayload;
}

export class AuthMiddleware implements IMiddleware {
    async run(ctx: MiddlewareContext, bag: AuthMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        let token = ctx.headers.authorization;
        bag.userPayload = null;

        if (!token) {
            return new HTTPResponse(401);
        }

        token = token.toString();
        if (!token.toLowerCase().startsWith('bearer')) {
            return new HTTPResponse(401);
        }

        token = token.slice('bearer'.length).trim();
        if (token) {
            const decodedToken = verifyJwt(token);
            if (decodedToken) {
                bag.userPayload = decodedToken;
                return undefined;
            }
        }

        return new HTTPResponse(401);
    }
}