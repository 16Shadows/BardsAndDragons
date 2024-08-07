import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import { GET, POST } from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {badRequest, json, notFound} from "../modules/core/routing/response";
import { Game } from "../model/game";
import { User } from "../model/user";
import { UsersGame } from "../model/usersGame";
import { QueryArgument, QueryBag } from "../modules/core/routing/query";
import { createQueryBuilder, DataSource } from "typeorm"
import { ILike, Table } from "typeorm"
import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { SelectQueryBuilder } from "typeorm/browser";
import { gameNotFound, sortTypeNotFound, subscriptionAlreadyExist, subscriptionNotExist } from "../utils/errorMessages";
import { GameTag } from "../model/gameTag";
import { Image } from "../model/image";

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
    tags: string[];
    image: string;
}

// Поиск данных в базе
type FindInList = {
    limit?: number;
    start?: number;
    name?: string;
    sort?: string;
}

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

type GameInfo = {
    id: number;
    name: string;
    playerCount: string;
    ageRating: string;
    description: string;
    tags: string[];
    images: string[];
}

type PlayerInfo = {
    username: string;
    displayName?: string;
    playsOnline: boolean;
}

type ListQuery = {
    start: number;
    count: number;
};

@Controller('api/v1/games')
export class GameController extends Object {
    static readonly ListCountHardLimit: number = 100;

    private _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        super();
        this._dbContext = dbContext;
    }

    @GET('{game:game}')
    @Return('application/json')
    async getGameInfo(bag: MiddlewareBag, game: Game): Promise<GameInfo> {
        return {
            id: game.id,
            name: game.name,
            playerCount: game.playerCount,
            ageRating: game.ageRating,
            description: game.description,
            tags: (await game.tags).map(x => x.text),
            images: (await game.images).map(x => x.blob)
        };
    }

    @GET()
    @Return('application/json')
    @QueryArgument('start', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: false
    })
    @QueryArgument('count', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: false
    })
    async getGamesList(bag: MiddlewareBag, query: ListQuery) {
        if (query.count > GameController.ListCountHardLimit)
            return badRequest([]);
        
        var repo = this._dbContext.getRepository(Game);

        return await Promise.all((await repo.find({
            skip: query.start,
            take: query.count
        })).map(async game => {
            return {
                id: game.id,
                name: game.name,
                playerCount: game.playerCount,
                ageRating: game.ageRating,
                description: game.description,
                tags: (await game.tags).map(x => x.text),
                images: (await game.images).map(x => x.blob)
            };
        }));
    }

    @GET('{game:game}/players')
    @Return('application/json')
    @QueryArgument('start', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: false
    })
    @QueryArgument('count', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: false
    })
    async getGamePlayers(bag: MiddlewareBag, game: Game, query: ListQuery) {
        if (query.count > GameController.ListCountHardLimit)
            return badRequest([]);
        
        var repo = this._dbContext.getRepository(UsersGame);

        var result = await repo.createQueryBuilder('game')
                               .innerJoinAndSelect('game.user', 'user', 'game.gameId = :id', {id: game.id})
                               .skip(query.start)
                               .take(query.count)
                               .getMany();

        return await Promise.all(result.map(async x => {
            var user = await x.user;

            return {
                username: user.username,
                displayName: user.displayName,
                playsOnline: x.playsOnline
            };
        }));
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
        let games: Game[];

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

        let gamesImages: GameData[];
        gamesImages = [];

        for (let i = 0; i < games.length; i++) {
            gamesImages.push({
                id: games[i].id,
                name: games[i].name,
                description: games[i].description,
                playerCount: games[i].playerCount,
                ageRating: games[i].ageRating,
                tags: (await games[i].tags).map(tag => tag.text),
                image: (await games[i].images).map(image => image.blob)[0]
            })
        }

        // Задержка для тестирования
        // await new Promise((resolve) => setTimeout(resolve, 3000));

        return gamesImages;
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
        // let games: SelectQueryBuilder<Game>;
        let games;
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
        {
        // let result = await games
        //     .leftJoinAndSelect('game.users', 'usersGame', 'usersGame.userId = :userId', {userId})
        //     .select([ 'game.id AS "id"', 'game.name AS "name"', 'game.description AS "description"', 
        //     'game.playerCount AS "playerCount"', 'game.ageRating AS "ageRating"', 'CASE WHEN usersGame.id IS NOT NULL THEN true ELSE false END AS "subscribed"' ])
        //     .offset(query.start) .limit(query.limit)
        //     .orderBy(`game.${sort}`, 'ASC')
        //     .getRawMany<GameData>();

        // for (let i = 0; i < result.length; i++) {
        //     let game = await repository.findOneBy({id: result[i]['id']});
        //     result[i]['tags'] = ((await game.tags).map(tag => tag.text));
        //     result[i]['tags'] = ((await game.tags).map(tag => tag.text));
        // }
        }

        games = await games.leftJoinAndSelect('game.users', 'user', 'user.userId = :userId', { userId: userId })
            .take(limit)
            .skip(query.start ?? 0)
            .orderBy(`game.${sort}`, 'ASC')
            .getMany()
        
        let gamesImages: GameData[];
        gamesImages = [];

        for (let i = 0; i < games.length; i++) {
            gamesImages.push({
                id: games[i].id,
                name: games[i].name,
                description: games[i].description,
                playerCount: games[i].playerCount,
                ageRating: games[i].ageRating,
                tags: (await games[i].tags).map(tag => tag.text),
                image: (await games[i].images).map(tag => tag.blob)[0],
                subscribed: (await games[i].users).length > 0
            })
        }

        return gamesImages;
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
        if (!await this._dbContext.getRepository(Game).existsBy({id: gameId})) {
            return notFound({message: gameNotFound});
        }

        let repository = this._dbContext.getRepository(UsersGame);

        // Проверка на существование подписки
        if (await repository.existsBy({game: game, user: bag.user})) {
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
        if (!await this._dbContext.getRepository(Game).existsBy({id: gameId})) {
            return notFound({message: gameNotFound});
        }

        let repository = this._dbContext.getRepository(UsersGame);

        // Удаление объекта из БД на основе id игры и пользователя
        let obj = await repository.findOneBy({game: game, user: bag.user});

        if (!obj)
            return badRequest({message: subscriptionNotExist});

        await repository.remove(obj);
    }

      // Проверка подписки на игру
      @GET('{gameId:int}/subscription')
      @Accept('application/json', 'text/plain')
      @Return('application/json')
      @Middleware(AuthMiddleware)
      async check_subscribe(bag: AuthMiddlewareBag, gameId:number) {
          const game = new Game();
          game.id = gameId;

          // Проверка на существование игры
          if (!await this._dbContext.getRepository(Game).existsBy({id: gameId})) {
              return notFound({message: gameNotFound});
          }

          let repository = this._dbContext.getRepository(UsersGame);

          // Проверка на существование подписки
          return await repository.existsBy({game: game, user: bag.user})
      }
}