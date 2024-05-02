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
    private _StreamMap: Map<string, SSEStream>;
    
    constructor() {
        this._StreamMap = new Map<string, SSEStream>();
    }

    sendNotification(targetUsername: string, notification: NotificationData): boolean {
        var stream = this._StreamMap.get(targetUsername);
        if (!stream)
            return false;

        stream.pushMessage({
            id: notification.id.toString(),
            event: 'notification',
            data: JSON.stringify(notification)
        });
        return true;
    }

    createStream(username: string): SSEStream {
        var stream = this._StreamMap.get(username);
        if (stream && !stream.closed)
            return stream;

        stream = new SSEStream();
        this._StreamMap.set(username, stream)

        stream.on('close', () => {
            this._StreamMap.delete(username);
        });

        return stream;
    }
}