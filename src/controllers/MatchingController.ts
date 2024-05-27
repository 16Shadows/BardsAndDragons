import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {GET, POST} from "../modules/core/routing/decorators";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import {Middleware} from "../modules/core/middleware/middleware";
import {MatchingService} from "../services/MatchingService";
import {AuthMiddleware, AuthMiddlewareBag} from "../middleware/AuthMiddleware";
import {TestService} from "../services/TestService";
import {badRequest, conflict} from "../modules/core/routing/response";
import {QueryArgument} from "../modules/core/routing/query";
import {HTTPResponseConvertBody} from "../modules/core/routing/core";
import {RejectedMatch} from "../model/rejectedMatch";
import {User} from "../model/user";

type ListQuery = {
    count?: number;
};

type PlayerData = {
    matchId: number;
    username: string;
    displayName: string;
    age?: number;
    city?: string;
    description: string;
    avatarPath?: string;
    games: string[];
}

@Controller('api/v1/matching')
export class MatchingController extends Object {
    private static readonly MAX_QUERY_COUNT: number = 10;

    private readonly _dbContext: ModelDataSource;
    private readonly _matchingService: MatchingService;

    // TODO: delete test service in production
    private readonly _testService: TestService;

    constructor(dbContext: ModelDataSource, matchingService: MatchingService, testService: TestService) {
        super();
        this._dbContext = dbContext;
        this._matchingService = matchingService;
        this._testService = testService;
    }

    // TODO: delete generateTestData in production
    @POST('generate-test-data')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async generateTestData(_bag: AuthMiddlewareBag, _body: Object) {
        try {
            await this._testService.generateTestData();
        } catch (e) {
            console.error(e);
            return badRequest({
                success: false,
                message: e
            });
        }

        console.log('Test data generated successfully.');
        return {
            success: true
        };
    }

    @POST('players')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async players(bag: AuthMiddlewareBag, _body: Object) {
        try {
            return await this._matchingService.getPotentialPlayers(bag.user);
        } catch (e) {
            console.error(e);
            return badRequest({
                success: false,
                message: e
            });
        }
    }

    @POST('ranked-players')
    @Accept('application/json')
    @Return('application/json')
    @Middleware(AuthMiddleware)
    async rankedPlayers(bag: AuthMiddlewareBag, _body: Object) {
        try {
            return await this._matchingService.getRankedPlayers(bag.user);
        } catch (e) {
            console.error(e);
            return badRequest({
                success: false,
                message: e
            });
        }
    }

    @GET('get-players')
    @Middleware(AuthMiddleware)
    @QueryArgument('count', {
        typeId: 'int',
        optional: true,
        canHaveMultipleValues: false
    })
    @Return('application/json')
    async getPlayers(_bag: AuthMiddlewareBag, queryBag: ListQuery): Promise<HTTPResponseConvertBody | PlayerData[]> {
        const count = queryBag.count ?? MatchingController.MAX_QUERY_COUNT;
        if (count < 0 || count > MatchingController.MAX_QUERY_COUNT)
            return badRequest();

        const playerData1: PlayerData = {
            matchId: 1,
            username: 'player1',
            displayName: 'Иван Иванов',
            age: 25,
            city: 'Москва',
            description: 'Являюсь заядлым геймером с детства. Играю в различные игры от шутеров до стратегий.',
            avatarPath: 'userimages/avatar2.png',
            games: ['Dota 2', 'CS: GO', 'World of Warcraft'],
        };

        const playerData2: PlayerData = {
            matchId: 2,
            username: 'player2',
            displayName: 'Елена Петрова',
            age: 28,
            city: 'Санкт-Петербург',
            description: 'Люблю активный образ жизни и спорт. Увлекаюсь путешествиями, особенно по горным районам. В свободное время занимаюсь фотографией и готовкой. Обожаю проводить время на свежем воздухе и наслаждаться природой.',
            avatarPath: 'userimages/avatar3.png',
            games: ['The Witcher 3', 'Assassin\'s Creed', 'Skyrim'],
        };

        return [playerData1, playerData2];
    }

    @POST('{receiver}/rejectMatch')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async rejectMatch(bag: AuthMiddlewareBag, receiver: string) {
        console.log(`Rejecting match between ${bag.user.username} and ${receiver}`);
    }

    // @POST('{receiver:user}/rejectMatch')
    // @Middleware(AuthMiddleware)
    // @Accept('application/json', 'text/plain')
    // async rejectMatch(bag: AuthMiddlewareBag, receiver: User) {
    //     const repo = this._dbContext.getRepository(RejectedMatch);
    //     const initiator = bag.user;
    //
    //     // Check if match already exists
    //     const match = await repo.createQueryBuilder('rejectedMatch')
    //         .where('(rejectedMatch.initiator = :initiator AND rejectedMatch.receiver = :receiver)', {
    //             initiator,
    //             receiver
    //         })
    //         .orWhere('(rejectedMatch.initiator = :receiver AND rejectedMatch.receiver = :initiator)', {
    //             initiator: receiver,
    //             receiver: initiator
    //         })
    //         .getOne();
    //
    //     if (match)
    //         return conflict();
    //
    //     // Create the rejected match
    //     const rejectedMatch = new RejectedMatch();
    //     rejectedMatch.initiator = Promise.resolve(initiator);
    //     rejectedMatch.receiver = Promise.resolve(receiver);
    //
    //     // Save the rejected match
    //     await repo.save(rejectedMatch);
    // }
}