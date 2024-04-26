import { ModelDataSource } from "../model/dataSource";
import { Game } from "../model/game";
import { Controller } from "../modules/core/controllers/decorators";
import { MiddlewareBag } from "../modules/core/middleware/middleware";
import { Return } from "../modules/core/mimeType/decorators";
import { GET } from "../modules/core/routing/decorators";
import { QueryArgument } from "../modules/core/routing/query";
import { badRequest } from "../modules/core/routing/response";

type GameInfo = {
    id: number;
    name: string;
    playerCount: string;
    ageRating: string;
    description: string;
    tags: string[];
    images: string[];
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
}