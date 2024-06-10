import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import { GET, POST } from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import { Game } from "../model/game";
import { QueryArgument, QueryBag } from "../modules/core/routing/query";
import { ILike } from "typeorm"
import { UsersGame } from "../model/usersGame";
import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { badRequest, notFound } from "../modules/core/routing/response";
import { SelectQueryBuilder } from "typeorm/browser";
import { gameNotFound, sortTypeNotFound, subscriptionAlreadyExist, subscriptionNotExist } from "../../client/src/utils/errorMessages";

// Список опций сортировки
const sortTypes = new Set(["id", "name"])

// Лимит получаемых в запросе объектов
const maxRequestLimit = 50

// Информация об игре
interface GameData 
{ 
    id: number; 
    name: string; 
    description: string; 
    playerCount: string;
    ageRating: string;
    subscribed?: boolean; 
}

// Поиск данных в базе
type FindInList = {
    limit?: number;
    start?: number;
    name?: string;
    sort?: string;
}

@Controller('api/v1/game')
export class GameController extends Object {
    protected readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        super();
        this._dbContext = dbContext;
    }

    // Получение списка игр из БД
    @GET('games')
    // Лимит игр
    @QueryArgument('limit', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    // Стартовая позицция
    @QueryArgument('start', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    // Название
    @QueryArgument('name', {
        canHaveMultipleValues: false,
        optional: true
    })
    // Параметр, по которому сортируем
    @QueryArgument('sort', {
        canHaveMultipleValues: false,
        optional: true
    })
    @Return('application/json')
    async getGames(bag: MiddlewareBag, query: FindInList) {
        let repository = this._dbContext.getRepository(Game);
        let games;

        // Базовый лимит - maxRequestLimit
        let limit = maxRequestLimit;
        if (query.limit && query.limit > 0 && query.limit < maxRequestLimit)
            limit = query.limit;

        // Базовая сортировка - по id игры
        let sort = query.sort ?? sortTypes.keys().next().value;

        if (!sortTypes.has(sort))
            return badRequest({message: sortTypeNotFound});

        // Поиск по имени
        if (query.name && query.name != "") {
            games = await repository.find({
                take: limit,
                skip: query.start ?? 0,
                where: {
                    name: ILike('%'+query.name+'%')
                },
                order: {
                    [sort]: 'ASC'
                }
            });
        }
        // Запрос без поиска
        else {
            games = await repository.find({
                take: limit,
                skip: query.start ?? 0,
                order: {
                    [sort]: 'ASC'
                }
            });
        }

        // Задержка для тестирования
        // await new Promise((resolve) => setTimeout(resolve, 3000));

        return games;
    }

    // Получение списка игр из БД
    @GET('games-with-subscription')
    // Лимит игр
    @QueryArgument('limit', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    // Стартовая позицция
    @QueryArgument('start', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    // Название
    @QueryArgument('name', {
        canHaveMultipleValues: false,
        optional: true
    })
    // Параметр, по которому сортируем
    @QueryArgument('sort', {
        canHaveMultipleValues: false,
        optional: true
    })
    @Middleware(AuthMiddleware)
    @Return('application/json')
    async getGamesSubscribe(bag: AuthMiddlewareBag, query: FindInList) {
        let repository = this._dbContext.getRepository(Game);
        let games: SelectQueryBuilder<Game>;
        let userId = bag.user.id;

        // Базовый лимит - maxRequestLimit
        let limit = maxRequestLimit;
        if (query.limit && query.limit > 0 && query.limit < maxRequestLimit)
            limit = query.limit;

        // Базовая сортировка - по id игры
        let sort = query.sort ?? sortTypes.keys().next().value;

        if (!sortTypes.has(sort))
            return badRequest({message: sortTypeNotFound});

        games = repository.createQueryBuilder("game")

        //  Поиск по имени с проверкой подписки на игры
        if (query.name && query.name != "") 
                games = games.where("game.name ilike :name", { name: `%${query.name}%` })

        // Если при дальнейшей разработке проблем выявлено не будет, то этот код будет вырезан.
        {
        // games = await games.leftJoinAndSelect('game.users', 'user', 'user.userId = :userId', { userId: userId })
        //     .take(limit)
        //     .skip(query.start ?? 0)
        //     .orderBy(`game.${sort}`, 'ASC')
        //     .getMany()
        
        // // Создание поля с информацией о подписке для каждой игры
        // for (let i = 0; i < games.length; i++) {

        //     if ((await games[i].users).length > 0)
        //         games[i]['subscribed'] = true;
        //     else
        //         games[i]['subscribed'] = false;

        //     console.log(games[i]['__users__'])

        //     delete games[i]['__users__'];
        // }
        }

        let result = await games
            .leftJoinAndSelect('game.users', 'usersGame', 'usersGame.userId = :userId', {userId})
            .select([ 'game.id AS "id"', 'game.name AS "name"', 'game.description AS "description"', 
            'game.playerCount AS "playerCount"', 'game.ageRating AS "ageRating"', 'CASE WHEN usersGame.id IS NOT NULL THEN true ELSE false END AS "subscribed"' ])
            .offset(query.start) .limit(query.limit)
            .orderBy(`game.${sort}`, 'ASC')
            .getRawMany<GameData>();

        return result;

        // Задержка для тестирования
        // await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // Получение количества игр
    @GET('games-number')
    // Название
    @QueryArgument('name', {
        canHaveMultipleValues: true,
        optional: true
    })
    @Return('application/json')
    async getGamesNumber(bag: MiddlewareBag, query: QueryBag) {
        let repository = this._dbContext.getRepository(Game);
        let games;

        // Получаем количество найденных по названию игр
        if (query.name && query.name != "") {
            games = await repository.count({
                where: {
                    name: ILike('%'+query.name+'%')
                }
            });
        }
        // Получаем общее количество игр в базе данных
        else {
            games = await repository.count();
        }

        return games;
    }

    // Подписка на игру
    @POST('{gameId:int}/subscribe')
    @Accept('application/json', 'text/plain')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async subscribe(bag: AuthMiddlewareBag, gameId:number) {
        const game = new Game();
        game.id = gameId;

        // Проверка на существование игры
        if (!await this._dbContext.getRepository(Game).findOneBy({id: gameId})) {
            return notFound({message: gameNotFound});
        }

        let repository = this._dbContext.getRepository(UsersGame);

        // Проверка на существование подписки
        if (await repository.findOneBy({game: game, user: bag.user})) {
            return badRequest({message: subscriptionAlreadyExist});
        }

        // Создание объекта для БД с получением данных
        const newPair = new UsersGame();

        newPair.user = Promise.resolve(bag.user);
        newPair.game = Promise.resolve(game)
        newPair.playsOnline = false;

        await repository.save(newPair);
    }

    // Отписка от игры
    @POST('{gameId:int}/unsubscribe')
    @Accept('application/json', 'text/plain')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async unsubscribe(bag: AuthMiddlewareBag, gameId:number) {
        const game = new Game();
        game.id = gameId;

        // Проверка на существование игры
        if (!await this._dbContext.getRepository(Game).findOneBy({id: gameId})) {
            return notFound({message: gameNotFound});
        }

        let repository = this._dbContext.getRepository(UsersGame);

        // Удаление объекта из БД на основе id игры и пользователя
        let obj = await repository.findOneBy({game: game, user: bag.user});

        if (!obj)
            return badRequest({message: subscriptionNotExist});

        await repository.remove(obj);
    }
}