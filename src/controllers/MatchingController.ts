import {Controller} from "../modules/core/controllers/decorators";
import {ModelDataSource} from "../model/dataSource";
import {POST} from "../modules/core/routing/decorators";
import {Accept, Return} from "../modules/core/mimeType/decorators";
import {Middleware} from "../modules/core/middleware/middleware";
import {MatchingService} from "../services/MatchingService";
import {AuthMiddleware, AuthMiddlewareBag} from "../middleware/AuthMiddleware";
import {TestService} from "../services/TestService";
import {badRequest} from "../modules/core/routing/response";

@Controller('api/v1/matching')
export class MatchingController extends Object {
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
}