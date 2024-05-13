import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import { DELETE, GET, POST } from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {AuthMiddleware, AuthMiddlewareBag, createAuthToken} from "../middleware/AuthMiddleware";
import {badRequest, json} from "../modules/core/routing/response";
import { Game } from "../model/game";
import { QueryArgument, QueryBag } from "../modules/core/routing/query";
import { Like } from "typeorm"
import { UsersGame } from "../model/usersGame";

@Controller('api/v1/user-games')
export class GameController extends Object {
    protected readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        super();
        this._dbContext = dbContext;
    }

    // Получение списка подписок на игры для пользователя
    @GET('games-for-user')
    // Лимит
    @QueryArgument('limit', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    // Начало поиска
    @QueryArgument('start', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    // Id пользователя
    @QueryArgument('userid', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: false
    })
    @Return('application/json')
    async getUserGames(bag: MiddlewareBag, query: QueryBag) {
        let repository = this._dbContext.getRepository(UsersGame);
        let userGames;
        
        let limit = 1000;
        if (query['limit'])
            limit = query['limit'];

        userGames = await repository.find({
            take: limit,
            skip: query['start'] ?? 0,
            where: {
                user: {
                    id: query['userid']
                }
            } 
        });

        console.log(Date.now());
        console.log("users-game");
        //console.log(games);
        return userGames;
    }

    // Подписка на игру
    @POST('subscribe')
    @Accept('application/json')
    @Return('application/json')
    async subscribe(bag: MiddlewareBag, body: { userId: number, game: Game }) {
        const {userId, game} = body;

        let repository = this._dbContext.getRepository(UsersGame);

        // Создание объекта для БД с получением данных
        const newPair = new UsersGame();

        newPair.user = Promise.resolve(await this._dbContext.getRepository(User).findOneBy({id: userId}));
        newPair.game = Promise.resolve(game)
        newPair.playsOnline = false;

        repository.save(newPair);

        return newPair;
    }

    // Отписка от игры
    @POST('unsubscribe')
    @Accept('application/json')
    @Return('application/json')
    async unsubscribe(bag: MiddlewareBag, body: { userId: number, game: Game }) {
        const {userId, game} = body;

        let repository = this._dbContext.getRepository(UsersGame);

        // Удаление объекта из БД на основе id игры и пользователя
        repository.delete({user: await this._dbContext.getRepository(User).findOneBy({id: userId}), game: game});

        return true;
    }
}