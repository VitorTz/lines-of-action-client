import { type Board, type Piece, type Position, type Move, BLACK_PIECE, WHITE_PIECE, EMPTY_CELL } from "../types/game";


export class GameModel {

    static COLUMNS: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

    static countPiecesInLine(board: Board, from: Position, direction: [number, number]): number {
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
    };

    static getValidMoves(board: Board, from: Position, player: Piece): Position[] {
        const moves: Position[] = [];
        const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of directions) {
            const distance = GameModel.countPiecesInLine(board, from, [dr, dc]);
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

    static getAllValidMoves(board: Board, player: Piece): Move[] {
        const allMoves: Move[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) {
                    const validMovesForPiece = GameModel.getValidMoves(board, { row, col }, player);
                    validMovesForPiece.forEach((to) => {
                        allMoves.push({
                            player: player === WHITE_PIECE ? 'white' : 'black',
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
    };

    static isConnected(board: Board, player: Piece): boolean {
        const pieces: Position[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === player) pieces.push({ row, col });
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
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && board[newRow][newCol] === player && !visited.has(key)) {
                        visited.add(key);
                        stack.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        return visited.size === pieces.length;
    };

    static checkWinner(board: Board, lastPlayer: Piece): Piece | null {
        const blackConnected = GameModel.isConnected(board, BLACK_PIECE);
        const whiteConnected = GameModel.isConnected(board, WHITE_PIECE);
        if (blackConnected && whiteConnected) return lastPlayer;
        if (blackConnected) return BLACK_PIECE;
        if (whiteConnected) return WHITE_PIECE;
        const blackCount = board.flat().filter((p) => p === BLACK_PIECE).length;
        const whiteCount = board.flat().filter((p) => p === WHITE_PIECE).length;
        if (blackCount === 1) return BLACK_PIECE;
        if (whiteCount === 1) return WHITE_PIECE;
        return null;
    };

    static applyMove(board: Board, from: Position, to: Position): { newBoard: Board, captured: boolean } {
        const newBoard = board.map(row => [...row]);
        const captured = newBoard[to.row][to.col] !== EMPTY_CELL;
        newBoard[to.row][to.col] = newBoard[from.row][from.col];
        newBoard[from.row][from.col] = EMPTY_CELL;
        return { newBoard, captured };
    }

    static countPieces(board: Board, piece: Piece): number {
        let count = 0;
        board.forEach((row: number[]) => row.forEach(col => { if (col === piece) count++ }))
        return count
    }

    static positionToNotation(pos: Position): string {
        return `${GameModel.COLUMNS[pos.col]}${8 - pos.row}`;
    }

    static playNotation(from: Position, to: Position, captured: boolean): string {
        return `${GameModel.positionToNotation(from)}${captured ? "x" : "-"}${GameModel.positionToNotation(to)}`;
    }

}