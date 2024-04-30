import {ModelDataSource} from "../model/dataSource";
import {User} from "../model/user";
import {IMiddleware, MiddlewareContext} from "../modules/core/middleware/middleware";
import {HTTPResponse} from "../modules/core/routing/core";
import jwt, {JwtPayload} from 'jsonwebtoken';
import {injectable} from "tsyringe";

type AuthToken = {
    username: string;
}

export function createAuthToken(user: AuthToken): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(user, process.env.JWT_SECRET_KEY, {expiresIn: '7d'}, (error: Error, encoded: string) => {
            if (error != undefined)
                reject(error);
            else
                resolve(encoded);
        });
    })
}

function verifyAuthToken(token: string): Promise<AuthToken> {
    return new Promise<AuthToken>((resolve) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (payload: JwtPayload | string) => {
            resolve(payload as AuthToken);
        });
    });
}

export type AuthMiddlewareBag = {
    user: User;
}

@injectable()
export class AuthMiddleware implements IMiddleware {
    private _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async run(ctx: MiddlewareContext, bag: AuthMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        let token = ctx.headers.authorization;

        if (typeof token != 'string')
            return new HTTPResponse(401);

        if (!token.toLowerCase().startsWith('bearer'))
            return new HTTPResponse(401);

        token = token.toLowerCase().slice('bearer'.length).trim();

        const decodedToken = await verifyAuthToken(token);

        if (!decodedToken)
            return new HTTPResponse(401);

        const repo = this._dbContext.getRepository(User);
        const user = await repo.findOneBy({
            username: decodedToken.username
        });

        if (!user)
            return new HTTPResponse(401);

        bag.user = user;
    }
}

export type OptionalAuthMiddlewareBag = Partial<AuthMiddlewareBag>;

@injectable()
export class OptionalAuthMiddleware implements IMiddleware {
    private _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async run(ctx: MiddlewareContext, bag: OptionalAuthMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        let token = ctx.headers.authorization;

        if (typeof token != 'string')
            return;

        if (!token.toLowerCase().startsWith('bearer'))
            return;

        token = token.toLowerCase().slice('bearer'.length).trim();

        const decodedToken = await verifyAuthToken(token);

        if (!decodedToken)
            return;

        const repo = this._dbContext.getRepository(User);
        bag.user = await repo.findOneBy({
            username: decodedToken.username
        });
    }
}