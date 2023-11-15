import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Player } from 'src/database/entities';

export default registerAs('database', (): TypeOrmModuleOptions => {

    if (!isDBType(process.env.DB_TYPE))
        throw new Error('Unsupported DB type provided!');

    return {
        type: process.env.DB_TYPE || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'password',
        synchronize: process.env.DB_SYNC === 'true',
        entities: [
            Player,
        ]
    }
})


type ExtractType<T, K extends keyof T> = K extends keyof T ? T[K] : never;

function isDBType(value: string): value is ExtractType<TypeOrmModuleOptions, 'type'> {
    const dbTypes = ["mysql", "mariadb", "postgres", "cockroachdb", "mssql", "sap", "oracle", "mongodb", "aurora-mysql"];

    return dbTypes.includes(value);
}