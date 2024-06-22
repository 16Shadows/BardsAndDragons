export enum NotificationTypes {
  FriendRequestAccepted = "friendRequestAccepted",
  FriendRequest = "friendRequest",
}

export type UserData = {
  avatar: string | null;
  username: string;
  displayName: string | null;
};

export type QueryNotificationObjectBase = {
  id: number;
  seen: boolean;
  type: NotificationTypes;
};

export type QueryNotificationObjectFriendRequestAccepted =
  QueryNotificationObjectBase & {
    type: NotificationTypes.FriendRequestAccepted;
    friendRequestAcceptedBy: UserData;
  };

export type QueryNotificationObjectFriendRequest =
  QueryNotificationObjectBase & {
    type: NotificationTypes.FriendRequest;
    friendRequestSentBy: UserData;
  };
