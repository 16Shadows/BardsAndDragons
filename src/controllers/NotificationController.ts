import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { ModelDataSource } from "../model/dataSource";
import { NotificationBase } from "../model/notifications/notificationBase";
import { Controller } from "../modules/core/controllers/decorators";
import { Middleware } from "../modules/core/middleware/middleware";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { GET, POST } from "../modules/core/routing/decorators";
import { QueryArgument, QueryBag } from "../modules/core/routing/query";
import { badRequest, forbidden } from "../modules/core/routing/response";

type UserData = {
    username: string,
    displayName?: string
};

type NotificationDataBase = {
    id: number;
    type: string;
    seen: boolean;
};

type FriendRequestNotification = NotificationDataBase & {
    type: 'friendRequest';
    friendRequestSentBy: UserData;
};

type FriendRequestAcceptedNotification = NotificationDataBase & {
    type: 'friendRequestAccepted';
    friendRequestAcceptedBy: UserData
};

type NotificationData = FriendRequestNotification | FriendRequestAcceptedNotification;

type GetNotificationsQueryBag = {
    start?: number;
    count?: number;
};

@Controller('api/v1/notifications')
export class NotificationController {
    static readonly MaxQueryCount : number = 100;

    protected _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    @GET()
    @Middleware(AuthMiddleware)
    @Return('application/json')
    @QueryArgument('start', {
        typeId: 'int',
        optional: true,
        canHaveMultipleValues: false
    })
    @QueryArgument('count', {
        typeId: 'int',
        optional: true,
        canHaveMultipleValues: false
    })
    async getNotifications(middlewareBag: AuthMiddlewareBag, queryBag: GetNotificationsQueryBag) {
        const start = queryBag.start ?? 0;
        const count = queryBag.count ?? NotificationController.MaxQueryCount;

        if (count > NotificationController.MaxQueryCount)
            return badRequest([]);

        const repo = this._dbContext.getRepository(NotificationBase);

        const notifs = await repo.createQueryBuilder('notif')
                           .where('notif.receiverId = :id', {id: middlewareBag.user.id})
                           .skip(start)
                           .take(count)
                           .getMany();

        return await Promise.all(notifs.map<Promise<NotificationData>>(async x => {
            switch(x.type) {
                case 'friendRequest':
                {
                    var sender = await (await x.friendRequest).user;
                    return {
                        id: x.id,
                        type: x.type,
                        seen: x.seen,
                        friendRequestSentBy: {
                            username: sender.username,
                            displayName: sender.displayName
                        }
                    };
                }
                case 'friendRequestAccepted': {
                    var acceptedBy = await (await x.friendRequestAccepted).user;
                    return {
                        id: x.id,
                        type: x.type,
                        seen: x.seen,
                        friendRequestAcceptedBy: {
                            username: acceptedBy.username,
                            displayName: acceptedBy.displayName
                        }
                    };
                }
            }
        }));
    }

    @POST('{notif:notification}/seen')
    @Accept('application/json')
    @Middleware(AuthMiddleware)
    async markNotifictionSeen(middlewareBag: AuthMiddlewareBag, notif: NotificationBase) {
        if ((await notif.receiver).id != middlewareBag.user.id)
            return forbidden(null);

        notif.seen = true;
        await this._dbContext.getRepository(NotificationBase).save(notif);
    }
}