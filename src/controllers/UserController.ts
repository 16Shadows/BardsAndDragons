import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {POST} from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import {ExtendedReturn} from "../modules/core/routing/core";
import bcrypt from "bcryptjs";
import {signJwt} from "../utils/jwt";
import {UserPayload} from "../utils/UserPayload";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

@Controller('api/v1/user')
export class UserController extends Object {
    protected readonly _dbContext: ModelDataSource;
    private contentTypeJson = {"Content-Type": "application/json"};

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
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'Required fields are not filled'});
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        if (await repository.findOneBy({username: username})) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'User with that username is already registered'});
        }

        const user: User = new User();
        user.username = username;
        user.email = email;
        user.passwordHash = await bcrypt.hash(password, 10);

        await repository.save(user);

        // Генерация токена
        const userPayload = new UserPayload(user.id, user.username);
        const token = signJwt(userPayload);

        return new ExtendedReturn(201, this.contentTypeJson, {
            message: 'User successfully registered',
            token: token,
            userId: user.id
        });
    }

    @POST('login')
    @Accept('application/json')
    @Return('application/json')
    async login(bag: MiddlewareBag, body: { username: string, password: string }) {
        const {username, password} = body;

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        const user = await repository.findOneBy({username: username});
        if (!user) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'User not found'});
        }

        // Проверка пароля
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return new ExtendedReturn(400, this.contentTypeJson, {error: 'Wrong password'});
        }

        // Генерация токена
        const userPayload = new UserPayload(user.id, user.username);
        const token = signJwt(userPayload);

        return new ExtendedReturn(200, this.contentTypeJson, {token: token});
    }

    @POST('logout')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async logout(bag: MiddlewareBag, body: Object) {
        return new ExtendedReturn(200, this.contentTypeJson, {message: 'Logout successful'});
    }
}