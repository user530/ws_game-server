import { MigrationInterface, QueryRunner, Table } from "typeorm"

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
                    },
                    {
                        name: 'game_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'player_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'row',
                        type: 'enum',
                        enum: ['Row_1', 'Row_2', 'Row_3',],
                        isNullable: false,
                    },
                    {
                        name: 'column',
                        type: 'enum',
                        enum: ['Col_1', 'Col_2', 'Col_3',],
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
                    },
                    {
                        columnNames: ['player_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                    },
                ]
            }
        ))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('game_turn');
    }

}
