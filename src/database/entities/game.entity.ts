import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { GameTurn } from './game-turn.entity';
import { ConflictException } from '@nestjs/common'

enum GameStatus {
    Pending = 'pending',
    InProgress = 'inProgress',
    Completed = 'completed',
    Aborted = 'aborted',
}

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

    @Column({ default: null })
    winner: Player | null;

    @ManyToOne(() => Player, { eager: true })
    @JoinColumn({ name: 'host_id' })
    host: Player;

    @ManyToOne(() => Player, { eager: true })
    @JoinColumn({ name: 'guest_id' })
    guest: Player;

    @OneToMany(() => GameTurn, (turn) => turn.game)
    @JoinColumn({ name: 'game_turns' })
    turns: GameTurn;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    checkUniqueIds() {
        if (this.host && this.guest && this.host.id === this.guest.id)
            throw new ConflictException('Host and client should be unique!');
    }
}