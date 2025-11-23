import { useEffect, useState, useRef } from "react";
import type { GameHistory, Move } from "../types/game";
import { linesApi } from "../api/linesApi";
import { generateNewGameBoard } from "../util/util";
import {
  BLACK_PIECE,
  WHITE_PIECE,
  EMPTY_CELL,
  type Board,
} from "../types/game";
import "./GameVsBot.css";
import type { PageType } from "../types/general";
import { useNotification } from "../components/notification/NotificationContext";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  ChevronRight,
  Play,
  Pause,
  CircleDot,
  Circle
} from "lucide-react";

interface GameReviewProps {
  navigate: (page: PageType, data?: any) => void;
  gameId: string;
}

const INITIAL_BOARD: Board = generateNewGameBoard();

const GameReview = ({ navigate, gameId }: GameReviewProps) => {
  const [gameHistory, setGameHistory] = useState<GameHistory | null>(null);
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blackCount, setBlackCount] = useState(0);
  const [whiteCount, setWhiteCount] = useState(0);

  const playInterval = useRef<any>(null);
  const { addNotification } = useNotification();

  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

  // Load match history
  useEffect(() => {
    const init = async () => {
      try {
        const g = await linesApi.game.getGameHistory(gameId);
        setGameHistory(g);
        setBoard(INITIAL_BOARD);
        updatePieceCounts(INITIAL_BOARD, []);
      } catch (e) {
        addNotification({
          title: "Match not found",
          type: "error",
        });
      }
    };
    init();
  }, []);

  const updatePieceCounts = (b: Board, moves: Move[]) => {
    let black = 0;
    let white = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === BLACK_PIECE) black++;
        if (board[r][c] === WHITE_PIECE) white++;
      }
    }

    setBlackCount(black);
    setWhiteCount(white);
  };

  const applyMoveListUpTo = (index: number): Board => {
    const newBoard: Board = generateNewGameBoard();
    if (!gameHistory) return newBoard;

    for (let i = 0; i < index; i++) {
      const move = gameHistory.gameMoves[i];
      const piece = move.player === "black" ? BLACK_PIECE : WHITE_PIECE;
      const { from, to } = move;

      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = EMPTY_CELL;
    }

    updatePieceCounts(newBoard, gameHistory.gameMoves.slice(0, index));

    return newBoard;
  };

  const goToMove = (index: number) => {
    if (!gameHistory) return;
    const capped = Math.min(Math.max(index, 0), gameHistory.gameMoves.length);
    setCurrentMoveIndex(capped);
    setBoard(applyMoveListUpTo(capped));
  };

  const nextMove = () => goToMove(currentMoveIndex + 1);
  const prevMove = () => goToMove(currentMoveIndex - 1);
  const firstMove = () => goToMove(0);
  const lastMove = () => gameHistory && goToMove(gameHistory.gameMoves.length);

  useEffect(() => {
    if (!isPlaying) {
      if (playInterval.current) clearInterval(playInterval.current);
      return;
    }

    playInterval.current = setInterval(() => {
      if (!gameHistory) return;
      if (currentMoveIndex >= gameHistory.gameMoves.length) {
        setIsPlaying(false);
        return;
      }
      nextMove();
    }, 800);

    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [isPlaying, currentMoveIndex]);

  const getCellColor = (r: number, c: number) =>
    (r + c) % 2 === 0 ? "#F0E5DD" : "#8C7A6B";

  const highlightLastMove = (r: number, c: number): boolean => {
    if (!gameHistory) return false;
    if (currentMoveIndex === 0) return false;

    const last = gameHistory.gameMoves[currentMoveIndex - 1];
    return (
      (last.from.row === r && last.from.col === c) ||
      (last.to.row === r && last.to.col === c)
    );
  };

  if (!gameHistory) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Game Review</h2>

      <div className="game-container">
        {/* BOARD */}
        <div className="board-wrapper">
          <div className="column-labels">
            {columns.map((col, idx) => (
              <div key={idx} className="label">
                {col}
              </div>
            ))}
          </div>

          <div className="board-row">
            <div className="row-labels">
              {[8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="label">
                  {n}
                </div>
              ))}
            </div>

            <div className="board">
              {board.map((row, r) => (
                <div key={r} className="row">
                  {row.map((cell, c) => (
                    <div
                      key={c}
                      className="cell"
                      style={{
                        backgroundColor: getCellColor(r, c),
                        border: highlightLastMove(r, c)
                          ? "3px solid #DC0E0E"
                          : "none",
                      }}
                    >
                      {cell !== EMPTY_CELL && (
                        <div
                          className="piece"
                          style={{
                            backgroundColor:
                              cell === BLACK_PIECE ? "#2B2118" : "#FFF4ED",
                            border:
                              cell === WHITE_PIECE
                                ? "2px solid #2B2118"
                                : "none",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div
            style={{
              marginTop: 20,
              padding: 10,
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CircleDot size={18} />
                {blackCount} peças
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Circle size={18} />
                {whiteCount} peças
              </div>

            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sidebar">          

          <div className="history-list">
            {gameHistory.gameMoves.map((m, i) => {
              const from = `${columns[m.from.col]}${8 - m.from.row}`;
              const to = `${columns[m.to.col]}${8 - m.to.row}`;
              const notation = `${from}${m.captured ? "x" : "-"}${to}`;

              const seconds = Math.floor(
                (new Date(m.timestamp).getTime() -
                  new Date(gameHistory.gameCreatedAt).getTime()) /
                  1000
              );

              return (
                <div
                  key={i}
                  className="move-entry"
                  style={{
                    background:
                      i === currentMoveIndex - 1 ? "#c9a27a" : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => goToMove(i + 1)}
                >
                  <span className="move-number">{i + 1}.</span>
                  <span className="move-notation">{notation}</span>
                  <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                    {seconds}s
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <button className="button" onClick={firstMove}>
                <ChevronsLeft />
              </button>

              <button className="button" onClick={lastMove}>
                <ChevronsRight />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <button className="button" onClick={prevMove}>
                <ChevronLeft />
              </button>
              <button className="button" onClick={nextMove}>
                <ChevronRight />
              </button>
            </div>

            <button className="button" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause /> : <Play />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameReview;
