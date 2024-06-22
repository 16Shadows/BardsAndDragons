import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Game } from "./game";

@Entity()
export class UsersGame {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.games, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete'
    })
    user: Promise<User>;

    @ManyToOne(() => Game, game => game.users, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete'
    })
    game: Promise<Game>;

    @Column({
        default: false
    })
    playsOnline: boolean;
}