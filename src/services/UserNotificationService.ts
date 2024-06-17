import { injectable } from "tsyringe";
import { SSEStream } from "../modules/sse/stream";
import { ModelDataSource } from "../model/dataSource";
import { User } from "../model/user";
import { NotificationBase } from "../model/notifications/notificationBase";
import { FriendRequestNotification } from "../model/notifications/friendRequestNotification";
import { FriendRequestAcceptedNotification } from "../model/notifications/friendRequestAcceptedNotification";
import { Image } from "../model/image";

export type UserData = {
    username: string,
    displayName?: string
    avatar?: string
};

export type NotificationDataBase = {
    id?: number; //If id is not set, this notification will get pushed into database as a new notification
    type: string;
    seen: boolean;
};

export type FriendRequestNotificationData = NotificationDataBase & {
    type: 'friendRequest';
    friendRequestSentBy: UserData;
};

export type FriendRequestAcceptedNotificationData = NotificationDataBase & {
    type: 'friendRequestAccepted';
    friendRequestAcceptedBy: UserData;
};

export type NotificationData = FriendRequestNotificationData | FriendRequestAcceptedNotificationData;

@injectable()
export class UserNotificationService {
    private _StreamMap: Map<string, SSEStream[]>;
    private _dbContext: ModelDataSource;
    
    constructor(dbContext: ModelDataSource) {
        this._StreamMap = new Map<string, SSEStream[]>();
        this._dbContext = dbContext;
    }

    async sendNotification(targetUsername: string, notification: NotificationData): Promise<boolean> {
        if (!notification.id && !(await this.pushNotificationToDatabase(targetUsername, notification)))
            return false;

        const streamList = this._StreamMap.get(targetUsername);
        if (!streamList || streamList.length == 0)
            return false;

        const mes = UserNotificationService.createNotificationMessage(notification);

        for (const stream of streamList)
            stream.pushMessage(mes);

        return true;
    }

    static createNotificationMessage(notification: NotificationData) {
        return {
            id: notification.id.toString(),
            event: 'notification',
            data: JSON.stringify(notification)
        };
    }

    protected async pushNotificationToDatabase(targetUsername: string, notification: NotificationData): Promise<boolean> {
        const userRepo = this._dbContext.getRepository(User);
        const user = await userRepo.findOneBy({
            username: targetUsername
        });

        if (user == null)
            return false;

        const notif = new NotificationBase();
        notif.receiver = Promise.resolve(user);
        notif.type = notification.type;
        switch (notification.type) {
            case 'friendRequest': {
                const requestTarget = await userRepo.findOneBy({
                    username: notification.friendRequestSentBy.username
                });

                if (requestTarget == undefined)
                    return;

                const friendRequest = new FriendRequestNotification();
                notif.friendRequest = Promise.resolve(friendRequest);
                friendRequest.parent = Promise.resolve(notif);
                friendRequest.user = Promise.resolve(requestTarget);
                break;
            }
            case 'friendRequestAccepted': {
                const requestTarget = await userRepo.findOneBy({
                    username: notification.friendRequestAcceptedBy.username
                });

                if (requestTarget == undefined)
                    return;

                const friendRequestAccepted = new FriendRequestAcceptedNotification();
                notif.friendRequestAccepted = Promise.resolve(friendRequestAccepted);
                friendRequestAccepted.parent = Promise.resolve(notif);
                friendRequestAccepted.user = Promise.resolve(requestTarget);
                break;
            }
        }

        await this._dbContext.getRepository(NotificationBase).save(notif);
        notification.id = notif.id;
        return true;
    }

    createSubscriber(username: string): SSEStream {
        var streamList = this._StreamMap.get(username);

        if (!streamList)
            this._StreamMap.set(username, streamList = []);

        const stream = new SSEStream();
        streamList.push(stream);

        stream.on('close', () => {
            var streamList = this._StreamMap.get(username);
            if (streamList)
            {
                streamList.splice(streamList.findIndex((v) => v == stream), 1);
                if (streamList.length == 0)
                    this._StreamMap.delete(username);
            }
        });

        return stream;
    }
}