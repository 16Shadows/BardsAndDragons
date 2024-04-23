import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Image } from './image';
import { City } from './city';
import { UsersGame } from './usersGame';

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

    @Column()
    email: string;

    @Column()
    isDeleted: boolean;

    //Extended account info (optional)

    @Column()
    birthday?: Date;
    
    @Column()
    displayName?: string;

    @ManyToOne(() => Image)
    avatar?: Promise<Image>;

    @Column()
    profileDescription?: string;

    @Column()
    contactInfo?: string;

    @ManyToOne(() => City)
    city?: Promise<City>;

    //Settings

    @Column()
    canDisplayAge: boolean;

    //Relations
    
    @OneToMany(() => UsersGame, game => game.user)
    games: Promise<UsersGame[]>;

    @ManyToMany(() => User, user => user.friends)
    friends: Promise<User[]>;
}