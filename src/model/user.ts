import {Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Image} from './image';
import {City} from './city';
import {UsersGame} from './usersGame';
import {NotificationBase} from './notifications/notificationBase';
import {Token} from "./token";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    //Basic account info (required)

    @Column({
        unique: true
    })
    username: string;

    @Column()
    passwordHash: string;

    @Column({
        unique: true
    })
    email: string;

    @Column({
        default: false
    })
    isDeleted: boolean;

    //Extended account info (optional)

    @Column({
        nullable: true
    })
    birthday?: Date;

    @Column({
        nullable: true
    })
    displayName?: string;

    @ManyToOne(() => Image, {
        onDelete: 'SET NULL'
    })
    avatar?: Promise<Image>;

    @Column({
        nullable: true
    })
    profileDescription?: string;

    @Column({
        nullable: true
    })
    contactInfo?: string;

    @ManyToOne(() => City, {
        onDelete: 'SET NULL'
    })
    city?: Promise<City>;

    //Settings

    @Column({
        default: false
    })
    canDisplayAge: boolean;

    //Relations

    @OneToMany(() => UsersGame, game => game.user, {
        cascade: true
    })
    games: Promise<UsersGame[]>;

    @ManyToMany(() => User, user => user.friends)
    friends: Promise<User[]>;

    @OneToMany(() => NotificationBase, notif => notif.receiver)
    notifications: Promise<NotificationBase[]>;

    // List of valid tokens for this user
    @OneToMany(() => Token, token => token.user, {
        cascade: true
    })
    tokens: Promise<Token[]>;
}