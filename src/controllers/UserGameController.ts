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
    username: string;
};

type GameData = {
    gamename: string;
    description: string;
    playerCount: string;
    ageRating: string;
    image?: string;
    tags?: string[];
    playsOnline: boolean;
};

@Controller('api/v1/user')
export class GamesController {
    protected static readonly MAX_QUERY_COUNT: number = 100;
    protected static readonly SORT_OPTIONS: Set<string> = new Set(['name']);
    protected static readonly SORT_ORDER_OPTIONS: Set<string> = new Set(['ASC', 'DESC']);

    protected _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    @GET('public/games')
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
    @QueryArgument('username', {
        optional: true,
        canHaveMultipleValues: false
    })
    @Return('application/json')
    async getUserGamesList(bag: AuthMiddlewareBag, queryBag: SortedListQuery): Promise<HTTPResponseConvertBody | GameData[]> {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? GamesController.MAX_QUERY_COUNT;
        const sortBy = queryBag.sortBy ?? GamesController.SORT_OPTIONS.keys().next().value;
        const sortOrder = queryBag.sortOrder ?? GamesController.SORT_ORDER_OPTIONS.keys().next().value;
        const username = queryBag.username;


        if (count < 0 || count > GamesController.MAX_QUERY_COUNT || !GamesController.SORT_OPTIONS.has(sortBy) || !GamesController.SORT_ORDER_OPTIONS.has(sortOrder))
            return badRequest();

        var userRepo = this._dbContext.getRepository(User);
        const user = await userRepo.findOneBy({username: username});

        if (!user) {
            return notFound();  // Возвращаем 404 ошибку, если пользователь не найден
        }

        const repo = this._dbContext.getRepository(UsersGame);

        const usersGames = await repo.createQueryBuilder('gameLink')

            .innerJoin('gameLink.game', 'game')
            .leftJoinAndSelect('game.images', 'images')
            .leftJoinAndSelect('game.tags', 'tags')
            .where('gameLink.userId = :userId', { userId: user.id })
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
                image: (await game.images[0])?.blob,
                tags: (await game.tags)?.map(tag => tag.text),
                playsOnline: x.playsOnline
            };
        }));
    }
}