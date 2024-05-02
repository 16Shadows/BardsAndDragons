import { SSEStream } from "../modules/sse/stream";

export type UserData = {
    username: string,
    displayName?: string
};

export type NotificationDataBase = {
    id: number;
    type: string;
    seen: boolean;
};

export type FriendRequestNotification = NotificationDataBase & {
    type: 'friendRequest';
    friendRequestSentBy: UserData;
};

export type FriendRequestAcceptedNotification = NotificationDataBase & {
    type: 'friendRequestAccepted';
    friendRequestAcceptedBy: UserData
};

export type NotificationData = FriendRequestNotification | FriendRequestAcceptedNotification;

export class UserNotificationService {
    private _StreamMap: Map<string, SSEStream[]>;
    
    constructor() {
        this._StreamMap = new Map<string, SSEStream[]>();
    }

    sendNotification(targetUsername: string, notification: NotificationData): boolean {
        const streamList = this._StreamMap.get(targetUsername);
        if (streamList?.length == 0)
            return false;

        const mes = {
            id: notification.id.toString(),
            event: 'notification',
            data: JSON.stringify(notification)
        }

        for (const stream of streamList)
            stream.pushMessage(mes);

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