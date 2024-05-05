import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {POST} from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {AuthMiddleware, AuthMiddlewareBag, createAuthToken} from "../middleware/AuthMiddleware";
import {badRequest, json} from "../modules/core/routing/response";

@Controller('api/v1/user')
export class UserController extends Object {
    protected readonly _dbContext: ModelDataSource;

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
            return badRequest({message: 'Required fields are not filled'});
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        if (await repository.findOneBy({username: username})) {
            return badRequest({message: 'User with that username is already registered'});
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

        return json({
            message: 'User successfully registered',
            token: token,
            userState: {
                username: user.username
            }
        }, 201);
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
            return badRequest({message: 'NotFilled'});
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        const user = await repository.findOneBy({username: username});
        if (!user) {
            return badRequest({message: 'UserNotFound'});
        }

        // Проверка пароля
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return badRequest({message: 'WrongPassword'});
        }

        // Генерация токена
        const token = await createAuthToken({
            username: user.username
        });

        return json({token: token, userState: {username: user.username}});
    }

    @POST('logout')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async logout(bag: AuthMiddlewareBag, body: Object) {
        return json({message: 'Logout successful'});
    }

    @POST('test-query-with-auth')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async testAuth(bag: AuthMiddlewareBag, body: Object) {
        return json({message: `Test query with auth successful. User: ${bag.user.username}`});
    }
}