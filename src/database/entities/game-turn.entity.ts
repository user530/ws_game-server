import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player, Game } from '../entities';
import { GameTableCol, GameTableRow } from 'src/shared/enums/game-turn';

@Entity()
export class GameTurn {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Game, (game) => game.turns, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'game_id' })
    game: Game;

    @ManyToOne(() => Player, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'player_id' })
    player: Player;

    @Column(
        {
            type: 'enum',
            enum: GameTableRow,
        }
    )
    row: GameTableRow;

    @Column(
        {
            type: 'enum',
            enum: GameTableCol
        }
    )
    column: GameTableCol;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}