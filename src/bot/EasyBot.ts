import { BotPlayer } from "./BotPlayer";
import type { Board, Move } from "../types/game";


export class EasyBot extends BotPlayer {
    selectMove(board: Board, allMoves: Move[]): Move {
        return allMoves[Math.floor(Math.random() * allMoves.length)];
    }

    getName(): string {
        return 'Fácil';
    }

    getDescription(): string {
        return 'Faz jogadas aleatórias';
    }
}