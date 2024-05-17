import { IntegerType } from "typeorm";

type NotificationTypes = "friendRequest" | "friendRequestAccepted";

export interface QueryNotificationObject {
  id: IntegerType;
  type: NotificationTypes;
  seen: boolean;
  friendRequestAcceptedBy?: { username: string; displayName: string | null };
  friendRequestSentBy?: { username: string; displayName: string | null };
}

export interface NotificationObject {
  id: IntegerType;
  type: NotificationTypes;
  seen: boolean;
  displayName: string | null;
  username: string | null;
}