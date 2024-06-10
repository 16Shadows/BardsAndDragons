import {ModelDataSource} from "../model/dataSource";
import {User} from "../model/user";
import {Converter, ITypeConverter} from "../modules/core/converters/converter";

@Converter('user')
export class UserConverter implements ITypeConverter {
    private _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async convertFromString(str: string): Promise<User | undefined> {
        const repo = this._dbContext.getRepository(User);
        const user = repo.findOneBy({
            username: str
        });

        return user == null ? undefined : user;
    }
}