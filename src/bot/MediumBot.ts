import { BotPlayer } from "./BotPlayer";
import { type Board, type Move, type Position, type Piece, EMPTY_CELL, WHITE_PIECE } from "../types/game";


export class MediumBot extends BotPlayer {
  selectMove(board: Board, allMoves: Move[]): Move {
    
    // Priorizar capturas
    const captureMoves = allMoves.filter(m => m.captured);
    if (captureMoves.length > 0 && Math.random() > 0.3) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    // Avaliar jogadas que melhoram conectividade
    const movesWithScore = allMoves.map(move => ({
      move,
      score: this.evaluateMove(board, move)
    }));

    movesWithScore.sort((a, b) => b.score - a.score);

    // Escolher entre as 3 melhores jogadas (com alguma aleatoriedade)
    const topMoves = movesWithScore.slice(0, Math.min(3, movesWithScore.length));
    const selected = topMoves[Math.floor(Math.random() * topMoves.length)];
    
    return selected.move;
  }

  private evaluateMove(board: Board, move: Move): number {
    let score = 0;

    // Simular a jogada
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[move.from.row][move.from.col];
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = EMPTY_CELL;

    // Pontos por captura
    if (move.captured) score += 15;

    // Avaliar conectividade após a jogada
    const connections = this.countConnections(newBoard, move.to, WHITE_PIECE);
    score += connections * 5;

    // Penalizar peças isoladas
    const isolated = this.isIsolated(newBoard, move.to, WHITE_PIECE);
    if (isolated) score -= 10;

    // Bonus por centralização
    const centerDistance = Math.abs(move.to.row - 3.5) + Math.abs(move.to.col - 3.5);
    score -= centerDistance;

    return score;
  }

  private countConnections(board: Board, pos: Position, player: Piece): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = pos.row + dr;
        const c = pos.col + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
          count++;
        }
      }
    }
    return count;
  }

  private isIsolated(board: Board, pos: Position, player: Piece): boolean {
    return this.countConnections(board, pos, player) === 0;
  }

  getName(): string {
    return 'Médio';
  }

}