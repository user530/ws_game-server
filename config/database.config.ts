import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Game, GameTurn, Player } from 'src/database/entities';
import { CreateGameTable, CreateGameTurnTable, CreatePlayerTable } from 'src/migrations';
import { DataSourceOptions } from 'typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {

    if (!isPostgressDB(process.env.DB_TYPE))
        throw new Error('Check DB config options!');

    const options: DataSourceOptions = {
        type: process.env.DB_TYPE || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'password',
        database: process.env.DB_NAME || 'ws_game',
        synchronize: process.env.DB_SYNC === 'true',
        entities: [
            Player,
            Game,
            GameTurn,
        ],
        migrations: [
            CreatePlayerTable,
            CreateGameTable,
            CreateGameTurnTable,
        ],
        migrationsRun: true,
    };

    return options;
})

function isPostgressDB(value: string): value is 'postgres' {
    return value === 'postgres'
}