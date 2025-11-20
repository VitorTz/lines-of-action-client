import { EMPTY_CELL, BLACK_PIECE, WHITE_PIECE, type Board } from "../types/game";

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

export function generateNewGameBoard(): Board {
    return [
        [EMPTY_CELL, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, EMPTY_CELL],
        [WHITE_PIECE, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, WHITE_PIECE],
        [WHITE_PIECE, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, WHITE_PIECE],
        [WHITE_PIECE, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, WHITE_PIECE],
        [WHITE_PIECE, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, WHITE_PIECE],
        [WHITE_PIECE, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, WHITE_PIECE],
        [WHITE_PIECE, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, EMPTY_CELL, WHITE_PIECE],
        [EMPTY_CELL, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, BLACK_PIECE, EMPTY_CELL],
    ]
}