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

// Definição para a Tabela de Transposição
interface TranspositionEntry {
    depth: number;
    value: number;
    flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND';
    bestMove?: Move;
}

export class HardBot extends BotPlayer {
    
    private readonly MAX_TIME_MS = 2000;
    private transpositionTable: Map<string, TranspositionEntry> = new Map();
    private nodesVisited = 0;

    // Pesos
    private readonly WEIGHTS = {
        CONNECTIVITY: 10000, // Vitória imediata
        PIECE_COUNT: 100,    // Material
        CENTRALIZATION: 10,  // Controle do centro
        CENTER_OF_MASS: 20,  // Agrupamento (Inverso da dispersão)
        MOBILITY: 2          // Quantidade de movimentos disponíveis
    };

    getName(): string {
        return 'Difícil';
    }

    selectMove(board: Board, allMoves: Move[]): Move {
        const startTime = Date.now();
        this.transpositionTable.clear();
        this.nodesVisited = 0;

        let bestMove = allMoves[0];
        let currentDepth = 1;
        
        while (true) {
            try {
                // Se passar do tempo, interrompe
                if (Date.now() - startTime > this.MAX_TIME_MS && currentDepth > 3) break;
                
                const { move, score } = this.rootMinimax(board, currentDepth, allMoves);
                bestMove = move;
                
                // Se achou vitória forçada, retorna imediatamente
                if (score > 90000) return bestMove;
                
                currentDepth++;
                // Limite de segurança para não travar o navegador/node
                if (currentDepth > 6) break; 
            } catch (e) {
                break;
            }
        }

        console.log(`Profundidade alcançada: ${currentDepth - 1}, Nós: ${this.nodesVisited}`);
        return bestMove;
    }

    private rootMinimax(board: Board, depth: number, moves: Move[]): { move: Move, score: number } {
        let bestScore = -Infinity;
        let bestMove = moves[0];
        let alpha = -Infinity;
        let beta = Infinity;

        // Ordenação de movimentos: Capturas e movimentos que centralizam primeiro
        const sortedMoves = this.orderMoves(board, moves);

        for (const move of sortedMoves) {
            const newBoard = this.applyMove(board, move);
            const score = this.minimax(newBoard, depth - 1, false, alpha, beta);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestScore);
        }

        return { move: bestMove, score: bestScore };
    }

    private minimax(board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
        this.nodesVisited++;
        
        // 1. Verificar Tabela de Transposição (Cache)
        const boardKey = this.serializeBoard(board, isMaximizing);
        const ttEntry = this.transpositionTable.get(boardKey);
        if (ttEntry && ttEntry.depth >= depth) {
            if (ttEntry.flag === 'EXACT') return ttEntry.value;
            if (ttEntry.flag === 'LOWERBOUND') alpha = Math.max(alpha, ttEntry.value);
            else if (ttEntry.flag === 'UPPERBOUND') beta = Math.min(beta, ttEntry.value);
            if (alpha >= beta) return ttEntry.value;
        }

        // 2. Verificar Fim de Jogo (Vitória/Derrota)
        const whiteWon = this.isConnected(board, WHITE_PIECE);
        const blackWon = this.isConnected(board, BLACK_PIECE);
        
        if (whiteWon && blackWon) return isMaximizing ? -Infinity : Infinity;
        if (whiteWon) return 100000 + depth; 
        if (blackWon) return -100000 - depth;

        // 3. Caso Base ou Quiescência
        if (depth === 0) {            
            return this.quiescenceSearch(board, alpha, beta, isMaximizing);
        }

        const player = isMaximizing ? WHITE_PIECE : BLACK_PIECE;
        const possibleMoves = this.getAllValidMoves(board, player);
        
        if (possibleMoves.length === 0) return isMaximizing ? -10000 : 10000;

        const orderedMoves = this.orderMoves(board, possibleMoves);
        
        let bestVal = isMaximizing ? -Infinity : Infinity;

        for (const move of orderedMoves) {
            const newBoard = this.applyMove(board, move);
            const val = this.minimax(newBoard, depth - 1, !isMaximizing, alpha, beta);

            if (isMaximizing) {
                bestVal = Math.max(bestVal, val);
                alpha = Math.max(alpha, bestVal);
            } else {
                bestVal = Math.min(bestVal, val);
                beta = Math.min(beta, bestVal);
            }

            if (beta <= alpha) break;
        }
        
        let flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND' = 'EXACT';
        if (bestVal <= alpha) flag = 'UPPERBOUND';
        else if (bestVal >= beta) flag = 'LOWERBOUND';

        this.transpositionTable.set(boardKey, {
            depth,
            value: bestVal,
            flag
        });

        return bestVal;
    }
    
    private quiescenceSearch(board: Board, alpha: number, beta: number, isMaximizing: boolean): number {
        const standPat = this.evaluatePosition(board);
        
        if (isMaximizing) {
            if (standPat >= beta) return beta;
            if (standPat > alpha) alpha = standPat;
        } else {
            if (standPat <= alpha) return alpha;
            if (standPat < beta) beta = standPat;
        }

        const player = isMaximizing ? WHITE_PIECE : BLACK_PIECE;
        const captureMoves = this.getAllValidMoves(board, player).filter(m => m.captured);

        for (const move of captureMoves) {
            const newBoard = this.applyMove(board, move);
            const score = this.quiescenceSearch(newBoard, alpha, beta, !isMaximizing);

            if (isMaximizing) {
                if (score >= beta) return beta;
                if (score > alpha) alpha = score;
            } else {
                if (score <= alpha) return alpha;
                if (score < beta) beta = score;
            }
        }

        return isMaximizing ? alpha : beta;
    }

    private evaluatePosition(board: Board): number {
        let whiteSumR = 0, whiteSumC = 0, whiteCount = 0;
        let blackSumR = 0, blackSumC = 0, blackCount = 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === WHITE_PIECE) {
                    whiteSumR += r;
                    whiteSumC += c;
                    whiteCount++;
                } else if (board[r][c] === BLACK_PIECE) {
                    blackSumR += r;
                    blackSumC += c;
                    blackCount++;
                }
            }
        }

        if (whiteCount === 0) return -100000;
        if (blackCount === 0) return 100000;

        // Média (Centro de Massa)
        const whiteComR = whiteSumR / whiteCount;
        const whiteComC = whiteSumC / whiteCount;
        const blackComR = blackSumR / blackCount;
        const blackComC = blackSumC / blackCount;

        // Distância média ao centro de massa
        let whiteDispersion = 0;
        let blackDispersion = 0;
        let whiteCentralization = 0;
        let blackCentralization = 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === WHITE_PIECE) {
                    whiteDispersion += Math.abs(r - whiteComR) + Math.abs(c - whiteComC);
                    if ((r === 3 || r === 4) && (c === 3 || c === 4)) 
                        whiteCentralization += 2;
                    else if ((r >= 2 && r <= 5) && (c >= 2 && c <= 5)) 
                        whiteCentralization += 1;
                } else if (board[r][c] === BLACK_PIECE) {
                    blackDispersion += Math.abs(r - blackComR) + Math.abs(c - blackComC);
                    if ((r === 3 || r === 4) && (c === 3 || c === 4)) 
                        blackCentralization += 2;
                    else if ((r >= 2 && r <= 5) && (c >= 2 && c <= 5)) 
                        blackCentralization += 1;
                }
            }
        }

        let score = 0;
                
        score += (whiteCount - blackCount) * this.WEIGHTS.PIECE_COUNT;
        score -= (whiteDispersion * this.WEIGHTS.CENTER_OF_MASS);
        score += (blackDispersion * this.WEIGHTS.CENTER_OF_MASS);
        score += (whiteCentralization - blackCentralization) * this.WEIGHTS.CENTRALIZATION;

        return score;
    }

    private orderMoves(board: Board, moves: Move[]): Move[] {
        return moves.sort((a, b) => {
            if (a.captured && !b.captured) return -1;
            if (!a.captured && b.captured) return 1;
            const distA = Math.abs(a.to.row - 3.5) + Math.abs(a.to.col - 3.5);
            const distB = Math.abs(b.to.row - 3.5) + Math.abs(b.to.col - 3.5);
            return distA - distB;
        });
    }
    
    // BFS para verificar conectividade
    private isConnected(board: Board, player: Piece): boolean {
        let startNode: Position | null = null;
        let pieceCount = 0;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (board[r][c] === player) {
                    pieceCount++;
                    if (!startNode) startNode = { row: r, col: c };
                }
            }
        }

        if (pieceCount <= 1) return true;
        if (!startNode) return false;

        let connectedCount = 0;
        const stack: Position[] = [startNode];
        const visited: boolean[][] = Array(8).fill(false).map(() => Array(8).fill(false));
        visited[startNode.row][startNode.col] = true;
        connectedCount++;

        while (stack.length > 0) {
            const { row, col } = stack.pop()!;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = row + dr;
                    const nc = col + dc;

                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && 
                        board[nr][nc] === player && !visited[nr][nc]) {
                        visited[nr][nc] = true;
                        connectedCount++;
                        stack.push({ row: nr, col: nc });
                    }
                }
            }
        }

        return connectedCount === pieceCount;
    }
    
    private serializeBoard(board: Board, maximizing: boolean): string {
        let key = maximizing ? '1' : '0';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                key += board[r][c];
            }
        }
        return key;
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
        const playerName = player === WHITE_PIECE ? 'white' : 'black';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    const validMovesForPiece = this.getValidMoves(board, { row, col }, player);
                    for(const to of validMovesForPiece) {
                         allMoves.push({
                            player: playerName,
                            from: { row, col },
                            to,
                            captured: board[to.row][to.col] !== EMPTY_CELL,
                            timestamp: new Date()
                        });
                    }
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
            if (distance === 0) continue; // Segurança

            const targetRow = from.row + dr * distance;
            const targetCol = from.col + dc * distance;

            if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) continue;

            // Verificar bloqueio no caminho (apenas peças adversárias bloqueiam o pulo)
            let pathClear = true;
            for (let i = 1; i < distance; i++) {
                const r = from.row + dr * i;
                const c = from.col + dc * i;
                if (board[r][c] !== EMPTY_CELL && board[r][c] !== player) {
                    pathClear = false; // Bloqueado por inimigo
                    break;
                }
            }

            if (pathClear) {
                const targetPiece = board[targetRow][targetCol];
                // Pode mover para célula vazia ou capturar inimigo
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

        // Frente
        for (let i = 1; i < 8; i++) {
            const r = from.row + dr * i;
            const c = from.col + dc * i;
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            if (board[r][c] !== EMPTY_CELL) count++;
        }
        // Trás
        for (let i = 1; i < 8; i++) {
            const r = from.row - dr * i;
            const c = from.col - dc * i;
            if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
            if (board[r][c] !== EMPTY_CELL) count++;
        }
        
        count++;
        return count;
    }
}