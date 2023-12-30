import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { GameTableCol, GameTableRow } from '@user530/ws_game_shared/enums';

export class CreateGameTurnsTable1700143531783 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: 'game_turn',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'game_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'player_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'row',
                        type: 'enum',
                        enum: [GameTableRow.Row_1, GameTableRow.Row_2, GameTableRow.Row_3,],
                        isNullable: false,
                    },
                    {
                        name: 'column',
                        type: 'enum',
                        enum: [GameTableCol.Col_1, GameTableCol.Col_2, GameTableCol.Col_3,],
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ['game_id'],
                        referencedTableName: 'game',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    {
                        columnNames: ['player_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL'
                    },
                ]
            }
        ))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('game_turn');
    }

}
