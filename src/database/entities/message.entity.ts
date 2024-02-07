import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

export enum ChatLayer {
    Hub = 'hub',
    Lobby = 'lobby',
    Game = 'game',
}

abstract class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(() => Player, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: Player;

    @Column({ length: 255 })
    message: string;
}

@Entity()
@Check(`("layer" = '${ChatLayer.Hub}' AND "room_id" IS NULL) OR ("layer" IN ('${ChatLayer.Lobby}', '${ChatLayer.Game}') AND "room_id" IS NOT NULL)`)
export class GeneralMessage extends ChatMessage {
    @Column({
        type: 'enum',
        enum: ChatLayer,
    })
    layer: ChatLayer;

    @Column({ nullable: true })
    room_id: string;
}

@Entity()
@Check('"author_id" <> "target_id"')
export class DirectMessage extends ChatMessage {
    @ManyToOne(() => Player, { eager: true, nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'target_id' })
    target: Player;
}