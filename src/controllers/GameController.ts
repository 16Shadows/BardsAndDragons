import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import { GET, POST } from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {badRequest, json, notFound} from "../modules/core/routing/response";
import { Game } from "../model/game";
import { QueryArgument, QueryBag } from "../modules/core/routing/query";
import { createQueryBuilder, DataSource, ILike, Like } from "typeorm"
import { UsersGame } from "../model/usersGame";
import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { gameNotFound, subscriptionAlreadyExist, subscriptionNotExist } from "../../client/src/utils/errorMessages";

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