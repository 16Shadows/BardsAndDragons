import {ModelDataSource} from "../model/dataSource";
import jwt, {JwtPayload} from "jsonwebtoken";
import {User} from "../model/user";
import {Token} from "../model/token";
import {injectable} from "tsyringe";

export type AuthToken = {
    username: string;
}

// Время жизни токена в днях
const expirationDays = 7;

function addDaysToDate(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
}

@injectable()
export class TokenService {
    protected readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    /**
     * Create JSON Web Token and save it in database
     * @param user
     */
    async createAuthToken(user: User): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const authToken: AuthToken = {
                username: user.username
            }
            jwt.sign(authToken, process.env.JWT_SECRET_KEY, {expiresIn: `${expirationDays}d`}, (error: Error, encoded: string) => {
                if (error) {
                    reject(error);
                } else {
                    // Сохранение токена в базе данных
                    const repo = this._dbContext.getRepository(Token);
                    const token = new Token();
                    token.token = encoded;
                    // Установка даты истечения токена
                    token.expirationDate = addDaysToDate(new Date(), expirationDays);
                    token.user = user;
                    repo.save(token);

                    resolve(encoded);
                }
            });
        })
    }

    private async verifyAuthToken(token: string): Promise<AuthToken> {
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

    /**
     * Get user by token. Returns null if token is invalid
     * @param token
     */
    async getUserByToken(token: string): Promise<User | null> {
        // Проверка токена на валидность
        try {
            const decodedToken = await this.verifyAuthToken(token);
            if (!decodedToken) {
                return null;
            }
        } catch {
            return null;
        }

        // Получение пользователя по токену
        const repo = this._dbContext.getRepository(Token);
        const tokenEntity = await repo.findOne({
            where: {token},
            relations: ['user']
        });
        if (!tokenEntity) {
            return null;
        }

        return tokenEntity.user;
    }

    /**
     * Delete token from database
     * @param token
     */
    async deleteToken(token: string): Promise<void> {
        const repo = this._dbContext.getRepository(Token);
        await repo.delete({token: token});
    }
}