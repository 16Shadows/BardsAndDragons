import { ModelDataSource } from "../model/dataSource";
import { Game } from "../model/game";
import { User } from "../model/user";
import { UsersGame } from "../model/usersGame";
import { Controller } from "../modules/core/controllers/decorators";
import { MiddlewareBag, Middleware } from "../modules/core/middleware/middleware";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { GET, POST } from "../modules/core/routing/decorators";
import { QueryArgument, QueryBag } from "../modules/core/routing/query";
import { badRequest, json } from "../modules/core/routing/response";
import bcrypt from "bcryptjs";
import { createQueryBuilder, DataSource, ILike, Like } from "typeorm"

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
            images: (await game.images).map(x => x.path)
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
                images: (await game.images).map(x => x.path)
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
        canHaveMultipleValues: true,
        optional: true
    })
    // Id пользователя для проверки подписки
    @QueryArgument('userid', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    // Параметр, по которому сортируем
    @QueryArgument('sort', {
        canHaveMultipleValues: false,
        optional: true
    })
    @Return('application/json')
    async getGames(bag: MiddlewareBag, query: QueryBag) {
        let repository = this._dbContext.getRepository(Game);
        let games;

        // Базовый лимит - 1000
        let limit = 1000;
        if (query['limit'])
            limit = query['limit'];

        // Базовая сортировка - по id игры
        let sort = query['sort'] ?? "id"

        // Если нет id пользователя
        if (!query['userid']) {
            // Поиск по имени
            if (query['name'] && query['name'] != "") {
                games = await repository.find({
                    take: limit,
                    skip: query['start'] ?? 0,
                    where: {
                        name: ILike('%'+query['name']+'%')
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
                    skip: query['start'] ?? 0,
                    order: {
                        [sort]: 'ASC'
                    }
                });
            }
        } else {
            // Поиск по имени с проверкой подписки на игры
            if (query['name'] && query['name'] != "") {
                games = await repository.createQueryBuilder("game")
                .where("game.name ilike :name", { name:`%${query['name']}%` } )
                .leftJoinAndSelect('game.users', 'user', 'user.userId = :userId', {userId: query['userid']})
                .take(limit)
                .skip(query['start'] ?? 0)
                .orderBy(`game.${sort}`, 'ASC')
                .getMany()
            }
            // Поиск без имени
            else {
                games = await repository.createQueryBuilder("game")
                .leftJoinAndSelect('game.users', 'user', 'user.userId = :userId', {userId: query['userid']})
                .take(limit)
                .skip(query['start'] ?? 0)
                .orderBy(`game.${sort}`, 'ASC')
                .getMany()
            }

            // Создание поле с информацией о подписке для каждой игры
            for (let i = 0; i < games.length; i++) {
            
                if ((await games[i].users).length > 0)
                    games[i]['subscribed'] = true;
                else
                    games[i]['subscribed'] = false;
    
                delete games[i]['__users__'];
            }


            // if (query['name'] && query['name'] != "") {
            //     games = await this._dbContext.manager.query('select "game".*, "users_game"."userId" from "game" left join "users_game" ON "game".id = "users_game"."gameId" AND "users_game"."userId" = 1')
            // }
            // else {
            //     games = await this._dbContext.manager.query('select "game".*, "users_game"."userId" from "game" left join "users_game" ON "game".id = "users_game"."gameId" AND "users_game"."userId" = 1')
            // }
        }

        console.log(Date.now());
        console.log("games");
        //console.log(games);

        // Задержка для тестирования
        // const date = Date.now();        
        // let currentDate = null;       
        // do {               
        //    currentDate = Date.now();      
        // } while (currentDate - date < 500); 

        return games;
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
        if (query['name'] && query['name'] != "") {
            games = await repository.count({
                where: {
                    name: ILike('%'+query['name']+'%')
                }
            });
        }
        // Получаем общее количество игр в базе данных
        else {
            games = await repository.count();
        }

        console.log(Date.now());
        console.log("games-number");
        //console.log(games);

        return games;
    }
}