
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
  from: Position;
  to: Position;
  captured: boolean;
}
