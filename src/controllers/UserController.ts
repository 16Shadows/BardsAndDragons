import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {POST} from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import {ExtendedReturn} from "../modules/core/routing/core";
import bcrypt from "bcryptjs";
import {AuthMiddleware, AuthMiddlewareBag, createAuthToken} from "../middleware/AuthMiddleware";

@Controller('api/v1/user')
export class UserController extends Object {
    protected readonly _dbContext: ModelDataSource;
    private contentTypeJson = {"Content-Type": "application/json"};
    private contentTypeJsonString = "application/json";

    constructor(dbContext: ModelDataSource) {
        super();
        this._dbContext = dbContext;
    }

    @POST('register')
    @Accept('application/json')
    @Return('application/json')
    async register(bag: MiddlewareBag, body: { username: string, email: string, password: string }) {
        const {username, email, password} = body;

        // Проверка заполнения полей
        if (!username || !email || !password) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'Required fields are not filled'},
                this.contentTypeJsonString);
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        if (await repository.findOneBy({username: username})) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'User with that username is already registered'},
                this.contentTypeJsonString);
        }

        const user: User = new User();
        user.username = username;
        user.email = email;
        user.passwordHash = await bcrypt.hash(password, 10);

        await repository.save(user);

        // Генерация токена
        const token = await createAuthToken({
            username: user.username
        });

        return new ExtendedReturn(201, this.contentTypeJson, {
            message: 'User successfully registered',
            token: token,
            userState: {
                username: user.username
            }
        }, this.contentTypeJsonString);
    }

    @POST('login')
    @Accept('application/json')
    @Return('application/json')
    async login(bag: MiddlewareBag, body: { login: string, password: string }) {
        const {login, password} = body;
        // Позже будем проверять это ник или почта
        const username = login;

        // Проверка заполнения полей
        if (!username || !password) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'Required fields are not filled'}, this.contentTypeJsonString);
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        const user = await repository.findOneBy({username: username});
        if (!user) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'User not found'}, this.contentTypeJsonString);
        }

        // Проверка пароля
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'Wrong password'}, this.contentTypeJsonString);
        }

        // Генерация токена
        const token = await createAuthToken({
            username: user.username
        });

        return new ExtendedReturn(200, this.contentTypeJson, {
            token: token,
            userState: {
                username: user.username
            }
        }, this.contentTypeJsonString);
    }

    @POST('logout')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async logout(bag: AuthMiddlewareBag, body: Object) {
        return new ExtendedReturn(200, this.contentTypeJson, {message: 'Logout successful'}, this.contentTypeJsonString);
    }
}