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
    return new Promise<AuthToken>((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error: Error, payload: JwtPayload | string) => {
            if (error) {
                reject(error);
            } else {
                resolve(payload as AuthToken);
            }
        });
    });
}

async function authenticateUser(ctx: MiddlewareContext, dbContext: ModelDataSource): Promise<User | null> {
    let token = ctx.headers.authorization;

    // Проверка токена на тип
    if (typeof token != 'string' || !token.toLowerCase().startsWith('bearer')) {
        return null;
    }

    // Удаление префикса
    token = token.slice('bearer'.length).trim();

    // Проверка токена на валидность
    const decodedToken = await verifyAuthToken(token).catch(() => {
        return null;
    });
    if (!decodedToken) {
        return null;
    }

    // Получение пользователя
    const repo = dbContext.getRepository(User);
    const user = await repo.findOneBy({
        username: decodedToken.username
    });
    if (!user) {
        return null;
    }

    return user;
}

export type AuthMiddlewareBag = {
    user: User;
}

@injectable()
export class AuthMiddleware implements IMiddleware {
    private readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async run(ctx: MiddlewareContext, bag: AuthMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        const user = await authenticateUser(ctx, this._dbContext);
        if (user) {
            bag.user = user;
        } else {
            return new HTTPResponse(401);
        }
    }
}

export type OptionalAuthMiddlewareBag = Partial<AuthMiddlewareBag>;

@injectable()
export class OptionalAuthMiddleware implements IMiddleware {
    private readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async run(ctx: MiddlewareContext, bag: OptionalAuthMiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined> {
        const user = await authenticateUser(ctx, this._dbContext);
        if (user) {
            bag.user = user;
        } else {
            return;
        }
    }
}