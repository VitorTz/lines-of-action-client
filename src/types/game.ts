
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  row: number;
  col: number;
}

export const EMPTY_CELL = 0
export const BLACK_PIECE = 1
export const WHITE_PIECE = 2


export type Piece = 0 | 1 | 2


export type Board = Piece[][];


export interface Move {
  
  player: 'black' | 'white'
  from: Position;
  to: Position;
  captured: boolean;
  timestamp: Date

}


export interface Game {

  playerBlack: string
  playerWhite: string
  status: 'waiting' | 'active' | 'finished';
  turn: 'black' | 'white';
  board: number[][]; // 8x8: 0 = Vazio, 1 = Preta, 2 = Branca
  moveHistory: Move[];
  winner?: string
  createdAt: Date;
  updatedAt: Date;
  
}
