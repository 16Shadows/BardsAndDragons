import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from 'typeorm';
import {User} from './user';

/**
 * Entity for user's valid tokens
 */
@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    token: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.tokens, {
        onDelete: 'CASCADE'
    })
    user: User;
}