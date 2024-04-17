import { Controller } from "../modules/core/controllers/controller";
import { Accept, Return, GET } from "../modules/core/routing/decorators";
import { ExampleService } from "../services/ExampleService";

@Controller('api/v1/test')
@Controller()
export class TestController extends Object
{
    constructor(service: ExampleService) {
        super();
        console.log("Test constructed");
        console.log(service.getValue());
    }

    @GET()
    async root() {
        return 'root';
    }

    @GET('index')
    async index() {
        console.log('index');
        return 'Hello, world!';
    }

    @GET('echo/{text}')
    async echo(text: string) {
        return text;
    }

    @GET('sum/{a:int}/{b:int}')
    async sum(a: number, b: number) {
        return a + b;
    }

    @GET('list')
    @Accept('application/json')
    @Return('application/json')
    async list() {
        console.log('list');
        return [1, 2, 3];
    }
};