import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { ModelDataSource } from "../model/dataSource";
import { NotificationBase } from "../model/notifications/notificationBase";
import { Controller } from "../modules/core/controllers/decorators";
import { Middleware } from "../modules/core/middleware/middleware";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { GET, POST } from "../modules/core/routing/decorators";
import { QueryArgument } from "../modules/core/routing/query";
import { badRequest, forbidden } from "../modules/core/routing/response";
import { HTTPResponse } from "../modules/core/routing/core";
import { LastEventIDBag, ParseLastEventID } from "../modules/sse/middleware";
import { NotificationData, UserNotificationService } from "../services/UserNotificationService";

type GetNotificationsQueryBag = {
    start?: number;
    count?: number;
};

@Controller('api/v1/notifications')
export class NotificationController {
    private static readonly MaxQueryCount : number = 100;
    private static readonly NotifDispatchGroupSize : number = 10;
    private static readonly NotifDispatchInterval : number = 100;

    protected _dbContext: ModelDataSource;
    protected _NotificationController: UserNotificationService;

    constructor(dbContext: ModelDataSource, notifs: UserNotificationService) {
        this._dbContext = dbContext;
        this._NotificationController = notifs;
    }

    private static async convertNotification(notif: NotificationBase): Promise<NotificationData> {
        switch(notif.type) {
            case 'friendRequest':
            {
                var sender = await (await notif.friendRequest).user;
                return {
                    id: notif.id,
                    type: notif.type,
                    seen: notif.seen,
                    friendRequestSentBy: {
                        username: sender.username,
                        displayName: sender.displayName
                    }
                };
            }
            case 'friendRequestAccepted': {
                var acceptedBy = await (await notif.friendRequestAccepted).user;
                return {
                    id: notif.id,
                    type: notif.type,
                    seen: notif.seen,
                    friendRequestAcceptedBy: {
                        username: acceptedBy.username,
                        displayName: acceptedBy.displayName
                    }
                };
            }
        }
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
                           .orderBy('notif.id', 'DESC')
                           .skip(start)
                           .take(count)
                           .getMany();

        return await Promise.all(notifs.map(NotificationController.convertNotification));
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

    @GET('subscribe')
    @Middleware(ParseLastEventID)
    @Middleware(AuthMiddleware)
    async subscribeToNotificationEvents(middlewareBag: AuthMiddlewareBag & LastEventIDBag) {
        var stream = this._NotificationController.createStream(middlewareBag.user.username);

        var lastNotifId = +middlewareBag.lastEventID;
        //Query all notifications after lastEventId (if it was sent)
        if (Number.isInteger(lastNotifId))
        {
            var self = this;
            async function queryNotifs() {
                const repo = self._dbContext.getRepository(NotificationBase);
                const notifs = await repo.createQueryBuilder('notif')
                                         .where('notif.receiverId = :recId AND notif.id > :lastId', {recId: middlewareBag.user.id, lastId: lastNotifId})
                                         .take(NotificationController.NotifDispatchGroupSize)
                                         .getMany();

                for (var notif of notifs)
                    self._NotificationController.sendNotification(middlewareBag.user.username, await NotificationController.convertNotification(notif));
                
                if (notifs.length == NotificationController.NotifDispatchGroupSize)
                {
                    lastNotifId = notifs[notifs.length - 1].id;
                    setTimeout(queryNotifs, NotificationController.NotifDispatchInterval);
                }
            }

            //Start querying after the response is completed
            setTimeout(queryNotifs, 1);
        }

        return new HTTPResponse(200, { 'Content-Type': 'text/event-stream', 'Connection': 'Keep-Alive', 'Cache-Control': 'no-cache' }, stream);
    }
}