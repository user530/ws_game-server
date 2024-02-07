import { ChatLayer } from 'src/database/entities/message.entity'
import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateGeneralMessageTable1707303369787 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: 'general_message',
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
                        name: 'layer',
                        type: 'enum',
                        enum: [
                            ChatLayer.Hub,
                            ChatLayer.Lobby,
                            ChatLayer.Game,
                        ],
                    },
                    {
                        name: 'room_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['author_id'],
                        referencedTableName: 'player',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE'
                    },
                ],
                checks: [
                    {
                        name: 'correct_message',
                        expression: `("layer" = '${ChatLayer.Hub}' AND "room_id" IS NULL) OR ("layer" IN ('${ChatLayer.Lobby}', '${ChatLayer.Game}') AND "room_id" IS NOT NULL)`
                    },
                ],
            }
        ))

    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('general_message');
    }

}
