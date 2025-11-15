
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  row: number;
  col: number;
}


export type Player = 'black' | 'white' | null;

export type Board = Player[][];


export interface Move {
  from: Position;
  to: Position;
  captured: boolean;
}
