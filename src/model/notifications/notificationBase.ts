import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user";
import { FriendRequestNotification } from "./friendRequestNotification";
import { FriendRequestAcceptedNotification } from "./friendRequestAcceptedNotification";

export type NotificationTypes = 'friendRequest' | 'friendRequestAccepted';

@Entity()
export class NotificationBase {
    @PrimaryGeneratedColumn()
    id: number;

    //Discriminator column
    @Column()
    type: NotificationTypes;

    //Shared info
    @ManyToOne(() => User, {
        onDelete: 'CASCADE'
    })
    receiver: Promise<User>;

    @Column({
        default: false
    })
    seen: boolean;

    //References to actual implementations
    @OneToOne(() => FriendRequestNotification, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    friendRequest?: Promise<FriendRequestNotification>;

    @OneToOne(() => FriendRequestAcceptedNotification, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    friendRequestAccepted?: Promise<FriendRequestAcceptedNotification>;
}