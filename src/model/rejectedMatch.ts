import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user";

@Entity()
export class RejectedMatch {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.rejectedMatchesInitiator, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete'
    })
    initiator: Promise<User>;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete'
    })
    receiver: Promise<User>;
}