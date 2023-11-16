import { GameStatus } from 'src/shared/enums/game';
import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateGameTable1700143513180 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: 'game',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            GameStatus.Pending,
                            GameStatus.InProgress,
                            GameStatus.Completed,
                            GameStatus.Aborted
                        ],
                        default: `'${GameStatus.Pending}'`,
                    },
                    {
                        name: 'winner_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'host_id',
                        type: 'uuid',
                    },
                    {
                        name: 'guest_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ['winner_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    },
                    {
                        columnNames: ['host_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    },
                    {
                        columnNames: ['guest_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    },
                ]
            }
        ))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('game');
    }

}
