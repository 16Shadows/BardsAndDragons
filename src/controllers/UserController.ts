import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {POST} from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {AuthMiddleware, AuthMiddlewareBag, createAuthToken} from "../middleware/AuthMiddleware";
import {badRequest, json} from "../modules/core/routing/response";
import {validateEmail, validateNickname, validatePassword} from "../utils/userValidation";
import {
    emailAlreadyUseError,
    invalidEmailError,
    invalidNicknameError, invalidPasswordError, nicknameAlreadyUseError,
    notFilledError,
    userNotFoundError,
    wrongPasswordError
} from "../utils/errorMessages";

// Константы
const saltRounds = 10;

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
    async register(bag: MiddlewareBag, body: { nickname: string, email: string, password: string }) {
        const {nickname, email, password} = body;

        // Проверка заполнения полей
        if (!nickname || !email || !password) {
            return badRequest({message: notFilledError});
        }
        // Проверка email
        if (!validateEmail(email)) {
            return badRequest({message: invalidEmailError});
        }
        // Проверка nickname
        if (!validateNickname(nickname)) {
            return badRequest({message: invalidNicknameError});
        }
        // Проверка пароля
        if (!validatePassword(password)) {
            return badRequest({message: invalidPasswordError});
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование никнейма
        if (await repository.findOneBy({username: nickname})) {
            return badRequest({message: nicknameAlreadyUseError});
        }
        // Проверка на существование email
        if (await repository.findOneBy({email: email})) {
            return badRequest({message: emailAlreadyUseError});
        }

        const user: User = new User();
        user.username = nickname;
        user.email = email;
        user.passwordHash = await bcrypt.hash(password, saltRounds);

        await repository.save(user);

        // Генерация токена
        const token = await createAuthToken({
            username: user.username
        });

        return json({
            token: token,
            userState: {
                username: user.username
            }
        }, 201);
    }

    async checkPasswordAndGenerateToken(password: string, user: User) {
        // Проверка пароля
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return badRequest({message: wrongPasswordError});
        }
        // Генерация токена
        const token = await createAuthToken({
            username: user.username
        });

        return json({token: token, userState: {username: user.username}});
    }

    @POST('login-by-email')
    @Accept('application/json')
    @Return('application/json')
    async loginByEmail(bag: MiddlewareBag, body: { email: string, password: string }) {
        const {email, password} = body;

        // Проверка заполнения полей
        if (!email || !password) {
            return badRequest({message: notFilledError});
        }
        // Проверка email
        if (!validateEmail(email)) {
            return badRequest({message: invalidEmailError});
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        const user = await repository.findOneBy({email: email});
        if (!user) {
            return badRequest({message: userNotFoundError});
        }

        return await this.checkPasswordAndGenerateToken(password, user);
    }

    @POST('login-by-nickname')
    @Accept('application/json')
    @Return('application/json')
    async loginByNickname(bag: MiddlewareBag, body: { nickname: string, password: string }) {
        const {nickname, password} = body;

        // Проверка заполнения полей
        if (!nickname || !password) {
            return badRequest({message: notFilledError});
        }
        // Проверка никнейма
        if (!validateNickname(nickname)) {
            return badRequest({message: invalidNicknameError});
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        const user = await repository.findOneBy({username: nickname});
        if (!user) {
            return badRequest({message: userNotFoundError});
        }

        return await this.checkPasswordAndGenerateToken(password, user);
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