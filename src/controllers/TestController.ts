import { Controller } from "../modules/core/controllers/decorators";
import { GET, POST } from "../modules/core/routing/decorators";
import { ExampleService } from "../services/ExampleService";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { ExtendedReturn } from "../modules/core/routing/core";
import { Middleware, MiddlewareBag } from "../modules/core/middleware/middleware";
import { ExampleMiddleware, ExampleMiddlewareBag } from "../middleware/ExampleMiddleware";
import { ModelDataSource } from "../model/dataSource";
import { User } from "../model/user";

@Controller('api/v1/test')
@Controller()
export class TestController extends Object
{
    protected readonly _dbContext: ModelDataSource;

    constructor(service: ExampleService, dbContext: ModelDataSource) {
        super();
        console.log("Test constructed");
        console.log(service.getValue());
        this._dbContext = dbContext;
    }

    @GET('adduser/{username}')
    async adduser(bag: MiddlewareBag, username: string) {
        var repo = this._dbContext.getRepository(User);

        if (await repo.findOneBy({username: username}) != null)
            return 'Duplicate username';

        var user: User = new User();
        user.username = username;
        user.passwordHash = 'test';
        user.email = 'unknown';

        await repo.save(user);

        return user.id;
    }

    @GET()
    async root() {
        return 'root';
    }

    @GET('middlewareTest')
    @Middleware(ExampleMiddleware)
    async middlewareTest(bag: ExampleMiddlewareBag) {
        return `Hello, world of ${bag['test']}!`;
    }

    @GET('index')
    async index() {
        console.log('index');
        return 'Hello, world!';
    }

    @GET('echo/{text}')
    async echo(bag: MiddlewareBag, text: string) {
        return text;
    }

    @GET('sum/{a:int}/{b:int}')
    async sum(bag: MiddlewareBag, a: number, b: number) {
        return a + b;
    }

    @POST('list')
    @Accept('application/json')
    @Return('application/json')
    async list(bag: MiddlewareBag, body: Object) {
        console.log(body);
        return [1, 2, 3];
    }

    @POST('list2')
    @Accept('application/json')
    async list2(bag: MiddlewareBag, body: Object) {
        console.log(body);
        return new ExtendedReturn(201, undefined, body, 'application/json');
    }

    @POST('list3')
    @Accept('application/json')
    @Return('application/json')
    async list3(bag: MiddlewareBag, body: Object) {
        console.log(body);
        return new ExtendedReturn(201, undefined, body);
    }
};