import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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
    @JoinTable({
        name: 'game_images'
    })
    images: Promise<Image[]>;

    @ManyToMany(() => GameTag)
    @JoinTable({
        name: 'game_tags'
    })
    tags: Promise<GameTag[]>;

    @OneToMany(() => UsersGame, user => user.game, {
        cascade: true
    })
    users: Promise<UsersGame[]>;
}