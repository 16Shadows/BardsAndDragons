import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {GET, POST} from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {AuthMiddleware, AuthMiddlewareBag, createAuthToken} from "../middleware/AuthMiddleware";
import {badRequest, json, status} from "../modules/core/routing/response";
import { City } from "../model/city";
import { Image } from "../model/image";

type UserInfo = {
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
            return badRequest({message: 'Required fields are not filled'});
        }

        let repository = this._dbContext.getRepository(User);

        // Проверка на существование пользователя
        const user = await repository.findOneBy({username: username});
        if (!user) {
            return badRequest({message: 'User not found'});
        }

        // Проверка пароля
        if (!await bcrypt.compare(password, user.passwordHash)) {
            return badRequest({message: 'Wrong password'});
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
    async logout(bag: MiddlewareBag, body: Object) {
        return json({message: 'Logout successful'});
    }

    @POST('test-query-with-auth')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async testAuth(bag: MiddlewareBag, body: Object) {
        return json({message: 'Test query with auth successful'});
    }

    @GET('@current')
    @Middleware(AuthMiddleware)
    @Return('application/json')
    async getMyInfo(bag: AuthMiddlewareBag): Promise<PersonalUserInfo> {
        return {
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
        var user = bag.user;

        var city: City;
        var avatar: Image;

        if (info.city)
        {
            var cityRepo = this._dbContext.getRepository(City);
            city = await cityRepo.findOneBy({
                name: info.city
            });
            if (city == null)
                return status(400);
        }

        if (info.avatar)
        {
            var imageRepo = this._dbContext.getRepository(Image);
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

        await this._dbContext.getRepository(User).save(user);
    }

    @POST('@current/delete')
    @Middleware(AuthMiddleware)
    async deleteMe(bag: AuthMiddlewareBag) {
        const repo = this._dbContext.getRepository(User);
        await repo.softRemove(bag.user);
        return this.logout(bag, {});
    }
}