import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import { GET, POST } from "../modules/core/routing/decorators";
import {Middleware, MiddlewareBag} from "../modules/core/middleware/middleware";
import {User} from "../model/user";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import bcrypt from "bcryptjs";
import {AuthMiddleware, AuthMiddlewareBag, createAuthToken} from "../middleware/AuthMiddleware";
import {badRequest, json} from "../modules/core/routing/response";
import { Game } from "../model/game";
import { QueryArgument, QueryBag } from "../modules/core/routing/query";
import { Like } from "typeorm"

@Controller('api/v1/game')
export class GameController extends Object {
    protected readonly _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        super();
        this._dbContext = dbContext;
    }

    @GET('games')
    @QueryArgument('limit', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    @QueryArgument('start', {
        typeId: 'int',
        canHaveMultipleValues: false,
        optional: true
    })
    @Return('application/json')
    async getGames(bag: MiddlewareBag, query: QueryBag) {
        let repository = this._dbContext.getRepository(Game);

        const games = await repository.find({
            take: query['limit'],
            skip: query['start']
        });
        //console.log(games);
        const date = Date.now();        
        let currentDate = null;       
        do {               
           currentDate = Date.now();      
        } while (currentDate - date < 500); 
        return games;
    }

    @GET('games-number')
    @QueryArgument('name', {
        typeId: 'string',
        canHaveMultipleValues: true,
        optional: true
    })
    @Return('application/json')
    async getGamesNumber(bag: MiddlewareBag, query: QueryBag) {
        let repository = this._dbContext.getRepository(Game);
        let games;

        if (query['name']) {
            games = await repository.count({
                where: {
                    name: Like('%'+query['name']+'%')
                }
            });
        }
        else {
            games = await repository.count();
        }

        //console.log(games);

        return games;
    }

}