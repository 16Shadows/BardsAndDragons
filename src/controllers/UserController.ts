import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {GET, POST} from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {
    AuthHeaderMiddleware,
    AuthHeaderMiddlewareBag,
    AuthMiddleware,
    AuthMiddlewareBag
} from "../middleware/AuthMiddleware";
import {QueryArgument, QueryBag} from "../modules/core/routing/query";
import {badRequest, json, status} from "../modules/core/routing/response";
import {City} from "../model/city";
import {Image} from "../model/image";
import {validateEmail, validateNickname, validatePassword} from "../utils/userValidation";
import {
    emailAlreadyUseError,
    invalidEmailError,
    invalidNicknameError,
    invalidPasswordError,
    invalidTokenError,
    logoutSuccessful,
    nicknameAlreadyUseError,
    notFilledError,
    userNotFoundError,
    wrongPasswordError
} from "../utils/errorMessages";
import {TokenService} from "../services/TokenService";

type UserInfo = {
    // TODO заменить на хранение на клиенте, не запрашивать
    username: string;
    email: string;
    //
    displayName?: string;
    description?: string;
    contactInfo?: string; //SHOULD ONLY BE RETURNED IF THE REQUESTING USER HAS ACCESS TO THIS INFORMATION (FRIEND)
    city?: string;
    avatar?: string;
};

/**
 * This info is accessible by anyone with access to the user's page
 */
type PublicUserInfo = UserInfo & {
    age?: number; //SHOULD ONLY BE RETURNED IF THE USER HAS SPECIFIED THAT THEIR AGE SHOULD BE DISPLAYED
};

/**
 * This info should only ever be accessible to the owner of the account.
 */
type PersonalUserInfo = UserInfo & {
    birthday?: Date;
    shouldDisplayAge: boolean;
};

// Константы
const saltRounds = 10;

@Controller('api/v1/user')
export class UserController extends Object {
    private readonly _dbContext: ModelDataSource;
    private readonly _tokenService: TokenService;

    constructor(dbContext: ModelDataSource, tokenService: TokenService) {
        super();
        this._dbContext = dbContext;
        this._tokenService = tokenService;
    }

    @POST('register')
    @Accept('application/json')
    @Return('application/json')
    async register(_: MiddlewareBag, body: { nickname: string, email: string, password: string }) {
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
        try {
            const token = await this._tokenService.createAuthToken(user);

            return json({
                token: token,
                userState: {
                    username: user.username
                }
            }, 201);
        } catch (e) {
            return badRequest({message: invalidTokenError});
        }
    }

    private async checkPasswordAndGenerateToken(password: string, user: User) {
        // Проверка пароля
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return badRequest({message: wrongPasswordError});
        }

        // Генерация токена
        try {
            const token = await this._tokenService.createAuthToken(user);
            return json({token: token, userState: {username: user.username}});
        } catch (e) {
            return badRequest({message: invalidTokenError});
        }
    }

    @POST('login-by-email')
    @Accept('application/json')
    @Return('application/json')
    async loginByEmail(_: MiddlewareBag, body: { email: string, password: string }) {
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
    async loginByNickname(_: MiddlewareBag, body: { nickname: string, password: string }) {
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
    @Middleware(AuthHeaderMiddleware)
    async logout(bag: AuthHeaderMiddlewareBag, _: Object) {
        if (!bag.token) {
            return badRequest({message: invalidTokenError});
        }
        const token = bag.token;
        await this._tokenService.deleteToken(token);
        return json({message: logoutSuccessful});
    }

    @POST('test-query-with-auth')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async testAuth(bag: AuthMiddlewareBag, _: Object) {
        return json({message: `Test query with auth successful. User: ${bag.user.username}`});
    }

    @GET('@current')
    @Middleware(AuthMiddleware)
    @Return('application/json')
    async getMyInfo(bag: AuthMiddlewareBag): Promise<PersonalUserInfo> {
        return {
            username: bag.user.username,
            email: bag.user.email,
            displayName: bag.user.displayName,
            description: bag.user.profileDescription,
            contactInfo: bag.user.contactInfo,
            city: (await bag.user.city)?.name,
            avatar: (await bag.user.avatar)?.blob,
            birthday: bag.user.birthday,
            shouldDisplayAge: bag.user.canDisplayAge
        };
    }

    @POST('@current')
    @Middleware(AuthMiddleware)
    @Accept('application/json')
    async postMyInfo(bag: AuthMiddlewareBag, info: Partial<PersonalUserInfo>) {
        const user = bag.user;

        let city: City;
        let avatar: Image;

        if (info.city) {
            const cityRepo = this._dbContext.getRepository(City);
            city = await cityRepo.findOneBy({
                name: info.city
            });
            if (city == null)
                return status(400);
        }

        if (info.avatar) {
            const imageRepo = this._dbContext.getRepository(Image);
            avatar = await imageRepo.findOneBy({
                blob: info.avatar
            });
            if (avatar == null)
                return status(400);
        }

        if (city != undefined)
            user.city = Promise.resolve(city);

        if (avatar != undefined)
            user.avatar = Promise.resolve(avatar);

        if (info.displayName != undefined)
            user.displayName = info.displayName;

        if (info.description != undefined)
            user.profileDescription = info.description;

        if (info.contactInfo != undefined)
            user.contactInfo = info.contactInfo;

        if (info.birthday != undefined)
            user.birthday = info.birthday;

        if (info.shouldDisplayAge != undefined)
            user.canDisplayAge = info.shouldDisplayAge;
    }

    // TODO: delete this unsafe function
    @GET('user-by-username')
    @QueryArgument('username', {
        canHaveMultipleValues: false,
        optional: false
    })
    @Return('application/json')
    async getGamesNumber(_: MiddlewareBag, query: QueryBag) {
        let repository = this._dbContext.getRepository(User);
        return await repository.findOneBy({username: query['username']});
    }
}