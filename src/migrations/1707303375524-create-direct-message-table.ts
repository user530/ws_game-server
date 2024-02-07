import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateDirectMessageTable1707303375524 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: 'direct_message',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'timestamp',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'author_id',
                        type: 'uuid',
                    },
                    {
                        name: 'message',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'target_id',
                        type: 'uuid'
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['author_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    {
                        columnNames: ['target_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
                checks: [
                    {
                        name: 'correct_dm',
                        expression: '"author_id" <> "target_id"',
                    },
                ],
            }
        ))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('direct_message');
    }

}
