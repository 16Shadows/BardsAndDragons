import { ModelDataSource } from "../model/dataSource";
import { NotificationBase } from "../model/notifications/notificationBase";
import { Converter, ITypeConverter } from "../modules/core/converters/converter";


@Converter('notification')
export class NotificationConverter implements ITypeConverter {
    private _dbContext: ModelDataSource;
    
    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    async convertFromString(str: string) {
        var id = +str;

        if (!Number.isInteger(id))
            return undefined;

        var repo = this._dbContext.getRepository(NotificationBase);

        var notif = await repo.findOneBy({
            id: id
        });

        return notif == null ? undefined : notif;
    }
}