import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { ModelDataSource } from "../model/dataSource";
import { Game } from "../model/game";
import { UsersGame } from "../model/usersGame";
import { Controller } from "../modules/core/controllers/decorators";
import { Middleware } from "../modules/core/middleware/middleware";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { HTTPResponseConvertBody } from "../modules/core/routing/core";
import { GET, POST } from "../modules/core/routing/decorators";
import { QueryArgument } from "../modules/core/routing/query";
import { badRequest, conflict, notFound } from "../modules/core/routing/response";
import { gameNotFound } from "../utils/errorMessages";

type SortedListQuery = {
    start?: number;
    count?: number;
    sortBy?: string;
    sortOrder?: string;
};

type GameData = {
    id: number;
    gamename: string;
    description: string;
    playerCount: string;
    ageRating: string;
    image: string;
    tags?: string[];
    playsOnline: boolean;
};

@Controller('api/v1/user')
export class MyGamesController {
    protected static readonly MAX_QUERY_COUNT: number = 100;
    protected static readonly SORT_OPTIONS: Set<string> = new Set(['name']);
    protected static readonly SORT_ORDER_OPTIONS: Set<string> = new Set(['ASC', 'DESC']);

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
        const count = queryBag.count ?? MyGamesController.MAX_QUERY_COUNT;
        const sortBy = queryBag.sortBy ?? MyGamesController.SORT_OPTIONS.keys().next().value;
        const sortOrder = queryBag.sortOrder ?? MyGamesController.SORT_ORDER_OPTIONS.keys().next().value;

        if (count < 0 || count > MyGamesController.MAX_QUERY_COUNT || !MyGamesController.SORT_OPTIONS.has(sortBy) || !MyGamesController.SORT_ORDER_OPTIONS.has(sortOrder))
            return badRequest();

        const repo = this._dbContext.getRepository(UsersGame);

        const usersGames = await repo.createQueryBuilder('gameLink')

            .innerJoin('gameLink.game', 'game')
            .leftJoinAndSelect('game.tags', 'tags')
            .leftJoinAndSelect('game.images', 'images')
            .where('gameLink.userId = :userId', { userId: bag.user.id })
            .addSelect('COALESCE(game.name)', 'name')
            .orderBy(sortBy, sortOrder)
            .skip(start)
            .take(count)
            .getMany();


        

        return await Promise.all(usersGames.map(async x => {
            let game = await x.game;
            return {
                id: game.id,
                gamename: game.name,
                description: game.description,
                playerCount: game.playerCount,
                ageRating: game.ageRating,
                image: (await game.images[0])?.blob,
                tags: (await game.tags)?.map(tag => tag.text),
                playsOnline: x.playsOnline
            };
        }));
    }

    @POST('{gameId:int}/updateOnlineStatus')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async updateOnlineStatus(bag: AuthMiddlewareBag, gameId:number, status: { playsOnline: boolean }) {
        const game = new Game();
        game.id = gameId;

        // Проверка на существование игры
        if (!await this._dbContext.getRepository(Game).findOneBy({id: gameId})) {
            return notFound({message: gameNotFound});
        }
        
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