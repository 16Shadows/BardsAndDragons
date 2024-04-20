import { Controller } from "../modules/core/controllers/decorators";
import { GET, POST } from "../modules/core/routing/decorators";
import { ExampleService } from "../services/ExampleService";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { ExtendedReturn } from "../modules/core/routing/core";

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

    @POST('list')
    @Accept('application/json')
    @Return('application/json')
    async list(body: Object) {
        console.log(body);
        return [1, 2, 3];
    }

    @POST('list2')
    @Accept('application/json')
    async list2(body: Object) {
        console.log(body);
        return new ExtendedReturn(201, undefined, body, 'application/json');
    }

    @POST('list3')
    @Accept('application/json')
    @Return('application/json')
    async list3(body: Object) {
        console.log(body);
        return new ExtendedReturn(201, undefined, body);
    }
};