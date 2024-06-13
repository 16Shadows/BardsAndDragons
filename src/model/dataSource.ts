import {DataSource} from "typeorm";
import {User} from "./user";
import {Game} from "./game";
import {GameTag} from "./gameTag";
import {Image} from "./image";
import {UsersGame} from "./usersGame";
import {City} from "./city";
import {NotificationBase} from "./notifications/notificationBase";
import {FriendRequestNotification} from "./notifications/friendRequestNotification";
import {FriendRequestAcceptedNotification} from "./notifications/friendRequestAcceptedNotification";
import {Token} from "./token";
import { UsersFriend } from "./usersFriend";

export class ModelDataSource extends DataSource {
    constructor() {
        super({
            type: 'postgres',
            host: process.env.DATABASE_HOSTNAME,
            port: +process.env.DATABASE_PORT,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            synchronize: true,
            logging: true,
            entities: [
                User,
                Token,
                Game,
                GameTag,
                Image,
                UsersGame,
                City,
                NotificationBase,
                FriendRequestNotification,
                FriendRequestAcceptedNotification,
                UsersFriend
            ]
        })
    }
}