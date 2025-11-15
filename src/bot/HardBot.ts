import { BotPlayer } from "./BotPlayer";
import type { Board, Move, Position, Player } from "../types/game";


export class HardBot extends BotPlayer {
    private readonly MAX_DEPTH = 2;

    selectMove(board: Board, allMoves: Move[]): Move {
        let bestMove = allMoves[0];
        let bestScore = -Infinity;

        for (const move of allMoves) {
            const newBoard = this.applyMove(board, move);
            const score = this.minimax(newBoard, this.MAX_DEPTH - 1, false, -Infinity, Infinity);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    private minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
        if (depth === 0) {
            return this.evaluatePosition(board);
        }

        const player = isMaximizing ? 'white' : 'black';
        const moves = this.getAllValidMoves(board, player);

        if (moves.length === 0) {
            return isMaximizing ? -10000 : 10000;
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                const newBoard = this.applyMove(board, move);
                const score = this.minimax(newBoard, depth - 1, false, alpha, beta);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                const newBoard = this.applyMove(board, move);
                const score = this.minimax(newBoard, depth - 1, true, alpha, beta);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    private evaluatePosition(board: Board): number {
        let score = 0;

        // Avaliar conectividade (mais importante)
        const whiteConnectivity = this.evaluateConnectivity(board, 'white');
        const blackConnectivity = this.evaluateConnectivity(board, 'black');
        score += (whiteConnectivity - blackConnectivity) * 20;

        // Avaliar número de peças
        const whitePieces = board.flat().filter(p => p === 'white').length;
        const blackPieces = board.flat().filter(p => p === 'black').length;
        score += (whitePieces - blackPieces) * 10;

        // Avaliar compactação (distância média entre peças)
        const whiteCompactness = this.evaluateCompactness(board, 'white');
        const blackCompactness = this.evaluateCompactness(board, 'black');
        score -= whiteCompactness * 2;
        score += blackCompactness * 2;

        return score;
    }

    private evaluateConnectivity(board: Board, player: Player): number {
        const pieces: Position[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    pieces.push({ row, col });
                }
            }
        }

        if (pieces.length === 0) return 0;

        let totalConnections = 0;
        for (const piece of pieces) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const r = piece.row + dr;
                    const c = piece.col + dc;
                    if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
                        totalConnections++;
                    }
                }
            }
        }

        return totalConnections;
    }

    private evaluateCompactness(board: Board, player: Player): number {
        const pieces: Position[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    pieces.push({ row, col });
                }
            }
        }

        if (pieces.length <= 1) return 0;

        let totalDistance = 0;
        for (let i = 0; i < pieces.length; i++) {
            for (let j = i + 1; j < pieces.length; j++) {
                const dist = Math.abs(pieces[i].row - pieces[j].row) +
                    Math.abs(pieces[i].col - pieces[j].col);
                totalDistance += dist;
            }
        }

        return totalDistance / (pieces.length * (pieces.length - 1) / 2);
    }

    private applyMove(board: Board, move: Move): Board {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[move.from.row][move.from.col];
        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;
        return newBoard;
    }

    private getAllValidMoves(board: Board, player: Player): Move[] {
        const allMoves: Move[] = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    const validMovesForPiece = this.getValidMoves(board, { row, col }, player);
                    validMovesForPiece.forEach(to => {
                        allMoves.push({
                            from: { row, col },
                            to,
                            captured: board[to.row][to.col] !== null
                        });
                    });
                }
            }
        }

        return allMoves;
    }

    private getValidMoves(board: Board, from: Position, player: Player): Position[] {
        const moves: Position[] = [];
        const directions: [number, number][] = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const distance = this.countPiecesInLine(board, from, [dr, dc]);
            const targetRow = from.row + dr * distance;
            const targetCol = from.col + dc * distance;

            if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) continue;

            let pathClear = true;
            for (let i = 1; i < distance; i++) {
                const r = from.row + dr * i;
                const c = from.col + dc * i;
                if (board[r][c] !== null && board[r][c] !== player) {
                    pathClear = false;
                    break;
                }
            }

            if (pathClear) {
                const targetPiece = board[targetRow][targetCol];
                if (targetPiece === null || targetPiece !== player) {
                    moves.push({ row: targetRow, col: targetCol });
                }
            }
        }

        return moves;
    }

    private countPiecesInLine(board: Board, from: Position, direction: [number, number]): number {
        let count = 0;
        const [dr, dc] = direction;

        for (let i = 1; i < 8; i++) {
            const r = from.row + dr * i;
            const c = from.col + dc * i;
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            if (board[r][c] !== null) count++;
        }

        for (let i = 1; i < 8; i++) {
            const r = from.row - dr * i;
            const c = from.col - dc * i;
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            if (board[r][c] !== null) count++;
        }

        count++;

        return count;
    }

    getName(): string {
        return 'Difícil';
    }

    getDescription(): string {
        return 'Usa estratégia avançada (Minimax)';
    }
}