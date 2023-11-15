import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player, Game } from '../entities'

export class GameTurn {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Game, (game) => game.turns, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'game_id' })
    game: Game;

    @ManyToOne(() => Player, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'player_id' })
    player: Player;

    @Column()
    row: number;

    @Column()
    column: number;

    @CreateDateColumn()
    timestamp: Date;
}