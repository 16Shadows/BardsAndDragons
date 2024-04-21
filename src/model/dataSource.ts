import { DataSource } from "typeorm";
import { User } from "./user";

export class ModelDataSource extends DataSource {
    constructor() {
        super({
            type: 'postgres',
            host: process.env.DATABASE_HOSTNAME,
            port: +process.env.DATABASE_PORT,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            synchronize: true,
            logging: true,
            entities: [User]
        })
    }
}