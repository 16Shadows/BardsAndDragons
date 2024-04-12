import { Controller, ControllerBase } from "../modules/core/controller";
import { ExampleService } from "../services/ExampleService";

@Controller()
export class TestController extends ControllerBase
{
    constructor(service: ExampleService) {
        super();
        console.log("Test constructed");
        console.log(service.getValue());
    }

    //Doesn't work yet, needs routing
    async index() {
        return 'Hello, world!';
    }
};