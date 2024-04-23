import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Game } from "./game";

@Entity()
export class UsersGame {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.games)
    user: Promise<User>;

    @ManyToOne(() => Game, game => game.users)
    game: Promise<Game>;

    @Column()
    playsOnline: boolean;
}