import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Image
{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    blob: string;
}