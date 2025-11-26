import type { User } from "./user";

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  row: number;
  col: number;
}

export const EMPTY_CELL = 0
export const BLACK_PIECE = 1
export const WHITE_PIECE = 2


export type Piece = 0 | 1 | 2


export type Board = number[][];


export interface Move {

  player: 'black' | 'white'
  from: Position;
  to: Position;
  captured: boolean;
  timestamp: Date

}


export interface Game {

  playerBlack: string;
  playerWhite: string;
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  turn: 'black' | 'white';
  board: number[][];
  moveHistory: Move[];
  winner?: string;
  playerBlackSocketId: string
  playerBlackIsReady: boolean
  playerWhiteSocketId: string
  playerWhiteIsReady: boolean
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  endedAt: Date;


}


export interface GameHistory {

  gameId: string
  playerBlack: User
  playerWhite: User
  winner: User | null
  gameCreatedAt: Date
  gameUpdatedAt: Date
  gameNumMoves: number
  gameMoves: Move[]

}