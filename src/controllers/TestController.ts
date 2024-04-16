import { Controller } from "../modules/core/controllers/controller";
import { GET } from "../modules/core/routing/decorators";
import { ExampleService } from "../services/ExampleService";

@Controller('api/v1/test')
export class TestController extends Object
{
    constructor(service: ExampleService) {
        super();
        console.log("Test constructed");
        console.log(service.getValue());
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
    async list() {
        console.log('list');
        return [1, 2, 3];
    }
};