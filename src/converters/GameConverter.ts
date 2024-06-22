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
        var repo = this._dbContext.getRepository(Game);
        var game = await repo.findOneBy({
            name: str
        });

        return game == null ? undefined : game;
    }
}