import { GameTableCol, GameTableRow } from '../enums/game-turn'

interface GameCmd {
    command: 'make_turn' | 'forfeit_match',
    data: any,
}

interface GameCmdData {
    game_id: string,
    player_id: string,
}

interface GameFieldData {
    row: GameTableRow,
    column: GameTableCol,
}

export interface MakeTurnGameCmd extends GameCmd {
    command: 'make_turn',
    data: GameCmdData & GameFieldData,
}

export interface ForfeitMatchGameCmd extends GameCmd {
    command: 'forfeit_match',
    data: GameCmdData,
}