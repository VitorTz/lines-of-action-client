import type { Board, Move } from "../types/game";


export abstract class BotPlayer {

  abstract selectMove(board: Board, allMoves: Move[]): Move;
  abstract getName(): string;

}