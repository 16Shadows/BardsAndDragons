import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {GET, POST} from "../modules/core/routing/decorators";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import {Middleware} from "../modules/core/middleware/middleware";
import {MatchingService, PlayerData, UserMatchingValidationResult} from "../services/MatchingService";
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

    @GET('is-valid-for-matching')
    @Middleware(AuthMiddleware)
    @Return('application/json')
    async isValidForMatching(bag: AuthMiddlewareBag): Promise<HTTPResponseConvertBody | UserMatchingValidationResult> {
        try {
            return await this._matchingService.isUserValidForMatching(bag.user);
        } catch (e) {
            return badRequest();
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
    async getPlayers(bag: AuthMiddlewareBag, queryBag: ListQuery): Promise<HTTPResponseConvertBody | PlayerData[]> {
        const count = queryBag.count ?? MatchingController.MAX_QUERY_COUNT;
        if (count < 0 || count > MatchingController.MAX_QUERY_COUNT)
            return badRequest();

        try {
            return await this._matchingService.getRankedPlayersForMatching(bag.user, count);
        } catch (e) {
            return badRequest();
        }
    }

    @POST('{receiver:user}/rejectMatch')
    @Middleware(AuthMiddleware)
    @Accept('application/json', 'text/plain')
    async rejectMatch(bag: AuthMiddlewareBag, receiver: User) {
        const repo = this._dbContext.getRepository(RejectedMatch);
        const initiator = bag.user;

        if (!receiver)
            return badRequest();

        // Check if match already exists
        const match = await repo.createQueryBuilder('rejectedMatch')
            .where('(rejectedMatch.initiatorId = :initiatorId AND rejectedMatch.receiverId = :receiverId)', {
                initiatorId: initiator.id,
                receiverId: receiver.id
            })
            .orWhere('(rejectedMatch.initiatorId = :receiverId AND rejectedMatch.receiverId = :initiatorId)', {
                initiatorId: receiver.id,
                receiverId: initiator.id
            })
            .getOne();

        if (match)
            return conflict();

        // Create the rejected match
        const rejectedMatch = new RejectedMatch();
        rejectedMatch.initiator = Promise.resolve(initiator);
        rejectedMatch.receiver = Promise.resolve(receiver);

        // Save the rejected match
        await repo.save(rejectedMatch);
    }
}