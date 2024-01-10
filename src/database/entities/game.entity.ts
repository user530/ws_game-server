import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Player } from './player.entity';
import { GameTurn } from './game-turn.entity';
import { ConflictException } from '@nestjs/common'
import { GameStatus } from '@user530/ws_game_shared/enums';


@Entity()
export class Game {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column(
        {
            type: 'enum',
            enum: GameStatus,
            default: GameStatus.Pending,
        }
    )
    status: GameStatus;

    @ManyToOne(() => Player, { eager: true, nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'winner_id' })
    winner: Player | null;

    @ManyToOne(() => Player, { eager: true, nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'host_id' })
    host: Player;

    @ManyToOne(() => Player, { eager: true, nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'guest_id' })
    guest: Player;

    @OneToMany(() => GameTurn, (turn) => turn.game)
    @JoinColumn({ name: 'game_turns' })
    turns: GameTurn[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    checkUniqueIds() {
        if (this.host && this.guest && this.host.id === this.guest.id)
            throw new ConflictException('Host and client should be unique!');
    }
}