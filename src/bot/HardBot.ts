import { 
    type Board, 
    type Move, 
    type Position, 
    type Piece, 
    WHITE_PIECE, 
    BLACK_PIECE, 
    EMPTY_CELL 
} from "../types/game";
import { BotPlayer } from "./BotPlayer";


export class HardBot extends BotPlayer {

    private readonly MAX_DEPTH = 6;

    selectMove(board: Board, allMoves: Move[]): Move {
        // Ordenar movimentos: capturas primeiro
        const sortedMoves = allMoves.sort((a, b) => {
            if (a.captured && !b.captured) return -1;
            if (!a.captured && b.captured) return 1;
            return 0;
        });

        let bestMove = sortedMoves[0];
        let bestScore = -Infinity;

        for (const move of sortedMoves) {
            const newBoard = this.applyMove(board, move);
            const score = this.minimax(newBoard, this.MAX_DEPTH - 1, false, -Infinity, Infinity);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }


    private isConnected(board: Board, player: Piece): boolean {
        const pieces: Position[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    pieces.push({ row, col });
                }
            }
        }

        if (pieces.length <= 1) return true;

        const visited = new Set<string>();
        const stack = [pieces[0]];
        visited.add(`${pieces[0].row},${pieces[0].col}`);

        while (stack.length > 0) {
            const current = stack.pop()!;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;

                    const newRow = current.row + dr;
                    const newCol = current.col + dc;
                    const key = `${newRow},${newCol}`;

                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 &&
                        board[newRow][newCol] === player && !visited.has(key)) {
                        visited.add(key);
                        stack.push({ row: newRow, col: newCol });
                    }
                }
            }
        }

        return visited.size === pieces.length;
    }

    private minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
        const whiteWon = this.isConnected(board, WHITE_PIECE);
        const blackWon = this.isConnected(board, BLACK_PIECE);

        if (whiteWon) return 100000 - (this.MAX_DEPTH - depth); // Vitórias mais rápidas valem mais
        if (blackWon) return -100000 + (this.MAX_DEPTH - depth);

        if (depth === 0) {
            return this.evaluatePosition(board);
        }
        if (depth === 0) {
            return this.evaluatePosition(board);
        }

        const piece = isMaximizing ? WHITE_PIECE : BLACK_PIECE;
        const moves = this.getAllValidMoves(board, piece);

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

    private getLargestConnectedGroup(board: Board, player: Piece): number {
        const pieces: Position[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    pieces.push({ row, col });
                }
            }
        }

        if (pieces.length === 0) return 0;

        const visited = new Set<string>();
        let maxGroupSize = 0;

        for (const piece of pieces) {
            const key = `${piece.row},${piece.col}`;
            if (visited.has(key)) continue;

            // BFS para encontrar grupo conectado
            const queue = [piece];
            const currentGroup = new Set<string>();
            currentGroup.add(key);
            visited.add(key);

            while (queue.length > 0) {
                const current = queue.shift()!;

                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;

                        const newRow = current.row + dr;
                        const newCol = current.col + dc;
                        const newKey = `${newRow},${newCol}`;

                        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 &&
                            board[newRow][newCol] === player && !visited.has(newKey)) {
                            visited.add(newKey);
                            currentGroup.add(newKey);
                            queue.push({ row: newRow, col: newCol });
                        }
                    }
                }
            }

            maxGroupSize = Math.max(maxGroupSize, currentGroup.size);
        }

        return maxGroupSize;
    }

    private evaluatePosition(board: Board): number {
        let score = 0;

        // 1. Conectividade (PESO MAIOR - é o objetivo do jogo!)
        const whiteConnectivity = this.evaluateConnectivity(board, WHITE_PIECE);
        const blackConnectivity = this.evaluateConnectivity(board, BLACK_PIECE);
        score += (whiteConnectivity - blackConnectivity) * 30; // Aumentado de 20

        // 2. Número de peças
        const whitePieces = board.flat().filter(p => p === WHITE_PIECE).length;
        const blackPieces = board.flat().filter(p => p === BLACK_PIECE).length;
        score += (whitePieces - blackPieces) * 15; // Aumentado de 10

        // 3. Compactação (menor distância = melhor)
        const whiteCompactness = this.evaluateCompactness(board, WHITE_PIECE);
        const blackCompactness = this.evaluateCompactness(board, BLACK_PIECE);
        score -= whiteCompactness * 3; // Aumentado de 2
        score += blackCompactness * 3;

        // 4. NOVO: Avaliar maior grupo conectado
        const whiteLargestGroup = this.getLargestConnectedGroup(board, WHITE_PIECE);
        const blackLargestGroup = this.getLargestConnectedGroup(board, BLACK_PIECE);
        score += (whiteLargestGroup - blackLargestGroup) * 25;

        return score;
    }

    private evaluateConnectivity(board: Board, player: Piece): number {
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

    private evaluateCompactness(board: Board, player: Piece): number {
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
        newBoard[move.from.row][move.from.col] = EMPTY_CELL;
        return newBoard;
    }

    private getAllValidMoves(board: Board, player: Piece): Move[] {
        const allMoves: Move[] = [];
        const playerName = player === WHITE_PIECE ? 'white' : 'black'

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    const validMovesForPiece = this.getValidMoves(board, { row, col }, player);
                    validMovesForPiece.forEach(to => {
                        allMoves.push({
                            player: playerName,
                            from: { row, col },
                            to,
                            captured: board[to.row][to.col] !== EMPTY_CELL,
                            timestamp: new Date()
                        });
                    });
                }
            }
        }

        return allMoves;
    }

    private getValidMoves(board: Board, from: Position, player: Piece): Position[] {
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
                if (board[r][c] !== EMPTY_CELL && board[r][c] !== player) {
                    pathClear = false;
                    break;
                }
            }

            if (pathClear) {
                const targetPiece = board[targetRow][targetCol];
                if (targetPiece === EMPTY_CELL || targetPiece !== player) {
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
            if (board[r][c] !== EMPTY_CELL) count++;
        }

        for (let i = 1; i < 8; i++) {
            const r = from.row - dr * i;
            const c = from.col - dc * i;
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            if (board[r][c] !== EMPTY_CELL) count++;
        }

        count++;

        return count;
    }

    getName(): string {
        return 'Difícil';
    }

}