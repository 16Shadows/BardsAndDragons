import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class UsersFriend {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.friends, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete'
    })
    user: Promise<User>;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete'
    })
    friend: Promise<User>;
}