import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { ModelDataSource } from "../model/dataSource";
import { Game } from "../model/game";
import { User } from "../model/user";
import { UsersGame } from "../model/usersGame";
import { Controller } from "../modules/core/controllers/decorators";
import { Middleware } from "../modules/core/middleware/middleware";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { HTTPResponseConvertBody } from "../modules/core/routing/core";
import { GET, POST } from "../modules/core/routing/decorators";
import { QueryArgument } from "../modules/core/routing/query";
import { badRequest, conflict, notFound } from "../modules/core/routing/response";

type SortedListQuery = {
    start?: number;
    count?: number;
    sortBy?: string;
    sortOrder?: string;
};

type GameData = {
    gamename: string;
    description: string;
    playerCount: string;
    ageRating: string;
    images?: string[];
    tags? : string[];
    playsOnline: boolean;
};

@Controller('api/v1/user')
export class GamesController {
    protected static readonly MAX_QUERY_COUNT : number = 100;
    protected static readonly SORT_OPTIONS : Set<string> = new Set(['name']);
    protected static readonly SORT_ORDER_OPTIONS : Set<string> = new Set(['ASC', 'DESC']);

    protected _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    //Query current games list
    @GET('@current/games/current')
    @Middleware(AuthMiddleware)
    @QueryArgument('start', {
        typeId: 'int',
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('count', {
        typeId: 'int',
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('sortBy', {
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('sortOrder', {
        optional: true,
        canHaveMultipleValues: false
    })
    @Return('application/json')
    async getGamesList(bag: AuthMiddlewareBag, queryBag: SortedListQuery): Promise<HTTPResponseConvertBody | GameData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? GamesController.MAX_QUERY_COUNT;
        const sortBy = queryBag.sortBy ?? GamesController.SORT_OPTIONS.keys().next().value;
        const sortOrder = queryBag.sortOrder ?? GamesController.SORT_ORDER_OPTIONS.keys().next().value;

        if (count < 0 || count > GamesController.MAX_QUERY_COUNT || !GamesController.SORT_OPTIONS.has(sortBy) || !GamesController.SORT_ORDER_OPTIONS.has(sortOrder))
            return badRequest();

        const repo = this._dbContext.getRepository(UsersGame);
        
        const usersGames = await repo.createQueryBuilder('gameLink')
                                    
                                    .innerJoin('gameLink.game', 'game')
                                    // .leftJoinAndSelect('game.images', 'images')
                                    // .leftJoinAndSelect('game.tags', 'tags')
                                    .where('gameLink.userId = :userId', { userId: bag.user.id })
                                    .addSelect('COALESCE(game.name)', 'name')
                                    .orderBy(sortBy, sortOrder)
                                    .skip(start)
                                    .take(count)
                                    .getMany();

        return await Promise.all(usersGames.map(async x => {
            let game = await x.game;
            return {
                gamename: game.name,
                description: game.description,
                playerCount: game.playerCount,
                ageRating: game.ageRating,
                // images: (await game.images)?.map(image => image.blob),
                //tags: (await game.tags)?.map(tag => tag.text),
                playsOnline: x.playsOnline
            };
        }));
    }

    @POST('{game:game}/addGame')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async addGame(bag: AuthMiddlewareBag, userGame: Game) {
        const repo = this._dbContext.getRepository(UsersGame);

        if (await repo.existsBy({user: bag.user, game: userGame}))
            return conflict();

        const gameLink = new UsersGame();
        gameLink.user = Promise.resolve(bag.user);
        gameLink.game = Promise.resolve(userGame);
        
        try {
            await repo.save(gameLink);
        }
        catch {
            return conflict();
        }
    }

    @POST('{game:game}/removeGame')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async removeGame(bag: AuthMiddlewareBag, userGame: Game) {
        const repo = this._dbContext.getRepository(UsersGame);

        const gameLink = await repo.findOneBy({
            user: bag.user,
            game: userGame
        });

        if (!gameLink)
            return badRequest();
        
        try {
            await repo.remove(gameLink);
        }
        catch {
            return badRequest();
        }
    }

    @POST('{game:game}/updateOnlineStatus')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async updateOnlineStatus(bag: AuthMiddlewareBag, game: Game, status: { playsOnline: boolean }) {
        const repo = this._dbContext.getRepository(UsersGame);

        const gameLink = await repo.findOneBy({
            user: bag.user,
            game: game
        });

        if (!gameLink)
            return badRequest();

        gameLink.playsOnline = status.playsOnline;

        try {
            await repo.save(gameLink);
        }
        catch {
            return badRequest();
        }
    }
}