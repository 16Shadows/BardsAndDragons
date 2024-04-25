import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameTag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    text: string;
}