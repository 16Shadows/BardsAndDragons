import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Image } from "./image";
import { GameTag } from "./gameTag";
import { UsersGame } from "./usersGame";

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    playerCount: string;

    @Column()
    ageRating: string;

    @ManyToMany(() => Image)
    images: Promise<Image[]>;

    @ManyToMany(() => GameTag)
    tags: Promise<GameTag[]>;

    @OneToMany(() => UsersGame, user => user.game, {
        cascade: true
    })
    users: Promise<UsersGame[]>;
}