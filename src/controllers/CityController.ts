import { City } from "../model/city";
import { ModelDataSource } from "../model/dataSource";
import { Controller } from "../modules/core/controllers/decorators";
import { Return } from "../modules/core/mimeType/decorators";
import { GET } from "../modules/core/routing/decorators";

@Controller('api/v1/cities')
export class CityController {
    protected _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    @GET()
    @Return('application/json')
    async getCities(): Promise<string[]> {
        var repo = this._dbContext.getRepository(City);

        return (await repo.find()).map(x => x.name);
    }
}