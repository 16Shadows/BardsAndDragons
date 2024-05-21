import {User} from "../model/user";
import {IMiddleware, MiddlewareContext} from "../modules/core/middleware/middleware";
import {HTTPResponse} from "../modules/core/routing/core";
import {injectable} from "tsyringe";
import {TokenService} from "../services/TokenService";

export type AuthMiddlewareBag = {
    user: User
}

/**
 * Get token from authorization header. Returns null if token is incorrect
 * @param auth_header
 */
function getTokenByAuthHeader(auth_header: any): string | null {
    // Проверка токена на тип
    if (typeof auth_header != 'string' || !auth_header.toLowerCase().startsWith('bearer')) {
        return null;
    }
    // Удаление префикса
    return auth_header.slice('bearer'.length).trim();
}

/**
 * AuthMiddleware put the user in the AuthMiddlewareBag if token is valid. Returns 401 if token is invalid
 */
@injectable()
export class AuthMiddleware implements IMiddleware {
    private readonly _tokenService: TokenService;

    constructor(tokenService: TokenService) {
        this._tokenService = tokenService;
    }

    async run(ctx: MiddlewareContext, bag: AuthMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        const token = getTokenByAuthHeader(ctx.headers?.authorization);
        const user = await this._tokenService.getUserByToken(token);
        if (user) {
            bag.user = user;
        } else {
            return new HTTPResponse(401);
        }
    }
}

export type OptionalAuthMiddlewareBag = Partial<AuthMiddlewareBag>;

/**
 * OptionalAuthMiddleware put the user in the OptionalAuthMiddlewareBag if token is valid. Continues query execution if token is invalid
 */
@injectable()
export class OptionalAuthMiddleware implements IMiddleware {
    private readonly _tokenService: TokenService;

    constructor(tokenService: TokenService) {
        this._tokenService = tokenService;
    }

    async run(ctx: MiddlewareContext, bag: OptionalAuthMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        const token = getTokenByAuthHeader(ctx.headers?.authorization);
        const user = await this._tokenService.getUserByToken(token);
        if (user) {
            bag.user = user;
        } else {
            return;
        }
    }
}

export type AuthHeaderMiddlewareBag = OptionalAuthMiddlewareBag & {
    token: string
}

/**
 * AuthHeaderMiddleware put the token in the AuthHeaderMiddlewareBag if token is correct
 */
@injectable()
export class AuthHeaderMiddleware implements IMiddleware {
    async run(ctx: MiddlewareContext, bag: AuthHeaderMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        bag.token = getTokenByAuthHeader(ctx.headers?.authorization);
        return;
    }
}