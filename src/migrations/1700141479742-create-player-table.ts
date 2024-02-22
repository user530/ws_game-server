import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreatePlayerTable1700141479742 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: 'player',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isUnique: true,
                        isNullable: false,
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
                        onUpdate: 'CURRENT_TIMESTAMP'
                    }
                ]
            }
        ));

        // Fill with some default values
        await queryRunner.query(`
            INSERT INTO player (name) VALUES ('player_1'), ('player_2'), ('player_3'), ('player_4'), ('player_5'), ('player_6'), ('player_7'), ('player_8'), ('player_9'), ('player_10') 
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('player');
    }

}
