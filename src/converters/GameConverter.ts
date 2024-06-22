import { ModelDataSource } from "../model/dataSource";
import { Game } from "../model/game";
import { Converter, ITypeConverter } from "../modules/core/converters/converter";

@Converter('game')
export class GameConverter implements ITypeConverter {
    private _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async convertFromString(str: string): Promise<Game | undefined> {
        var id = +str;
        if (!Number.isInteger(id))
            return undefined;

        var gameRepo = this._dbContext.getRepository(Game);
        var game = await gameRepo.findOneBy({
            id: id
        });

        return game != null ? game : undefined;
    }
}