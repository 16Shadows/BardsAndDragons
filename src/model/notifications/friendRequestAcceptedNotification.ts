import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user";
import { NotificationBase } from "./notificationBase";

@Entity()
export class FriendRequestAcceptedNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @OneToOne(() => NotificationBase, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    parent: NotificationBase;
}