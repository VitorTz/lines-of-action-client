import { useState, useEffect, useRef } from "react";
import { type Piece, type Board, type Position, type Move, BLACK_PIECE, EMPTY_CELL, WHITE_PIECE } from "../types/game";
import { BotPlayer } from "../bot/BotPlayer";
import { EasyBot } from "../bot/EasyBot";
import { MediumBot } from "../bot/MediumBot";
import { HardBot } from "../bot/HardBot";
import type { Difficulty } from "../types/game";
import { formatTime, generateNewGameBoard } from "../util/util";
import type { PageType } from "../types/general";
import "./GameVsBot.css";


const INITIAL_BOARD: Board = generateNewGameBoard()

interface GameVsBotProps {
  navigate: (page: PageType, data?: any) => void;
  difficulty?: Difficulty;
}

const GameVsBot = ({ navigate, difficulty = "easy" }: GameVsBotProps) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [bot, setBot] = useState<BotPlayer>(new EasyBot());
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Piece>(BLACK_PIECE);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Piece | null>(null);
  const [animatingPiece, setAnimatingPiece] = useState<{
    from: Position;
    to: Position;
    piece: Piece;
  } | null>(null);
  const [blackCaptures, setBlackCaptures] = useState(0);
  const [whiteCaptures, setWhiteCaptures] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastMove, setLastMove] = useState<{
    from: Position;
    to: Position;
  } | null>(null);

  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const audioContextRef = useRef<AudioContext | null>(null);

  const startGame = () => {
    setBoard(INITIAL_BOARD);
    setBot(instanciateBot());
    setCurrentPlayer(BLACK_PIECE);
    setSelectedPiece(null);
    setValidMoves([]);
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
    setAnimatingPiece(null);
    setBlackCaptures(0);
    setWhiteCaptures(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setLastMove(null);
    setGameStarted(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }
    startGame();
  }, []);

  useEffect(() => {
    if (!gameOver && gameStarted) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, gameOver, gameStarted]);

  const instanciateBot = () => {
    switch (difficulty) {
      case "easy":
        return new EasyBot();
      case "medium":
        return new MediumBot();
      case "hard":
        return new HardBot();
      default:
        return new MediumBot();
    }
  };
  const playLocalSound = (path: string) => {
    const audio = new Audio(path);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const playSound = (
    frequency: number,
    duration: number,
    type: OscillatorType = "sine"
  ) => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + duration
      );

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log("Audio not available");
    }
  };

  const playCaptureSound = () => {
    playLocalSound("songs/capture.mp3");
  };

  const playMoveSound = () => {
    playLocalSound("songs/move-self.mp3");
  };

  const playWinSound = () => {
    playSound(523, 0.2);
    setTimeout(() => playSound(659, 0.2), 200);
    setTimeout(() => playSound(784, 0.3), 400);
  };

  const positionToNotation = (pos: Position): string => {
    return `${columns[pos.col]}${8 - pos.row}`;
  };

  const countPiecesInLine = (
    board: Board,
    from: Position,
    direction: [number, number]
  ): number => {
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

  const getValidMoves = (
    board: Board,
    from: Position,
    player: Piece
  ): Position[] => {
    const moves: Position[] = [];
    const directions: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const distance = countPiecesInLine(board, from, [dr, dc]);
      const targetRow = from.row + dr * distance;
      const targetCol = from.col + dc * distance;

      if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8)
        continue;

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
  };

  const getAllValidMoves = (board: Board, player: Piece): Move[] => {
    const allMoves: Move[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === player) {
          const validMovesForPiece = getValidMoves(board, { row, col }, player);
          validMovesForPiece.forEach((to) => {
            allMoves.push({
              from: { row, col },
              to,
              captured: board[to.row][to.col] !== EMPTY_CELL,
            });
          });
        }
      }
    }

    return allMoves;
  };

  const isConnected = (board: Board, player: Piece): boolean => {
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

          if (
            newRow >= 0 &&
            newRow < 8 &&
            newCol >= 0 &&
            newCol < 8 &&
            board[newRow][newCol] === player &&
            !visited.has(key)
          ) {
            visited.add(key);
            stack.push({ row: newRow, col: newCol });
          }
        }
      }
    }

    return visited.size === pieces.length;
  };

  const checkWinner = (board: Board, lastPlayer: Piece): Piece | null => {
    const blackConnected = isConnected(board, BLACK_PIECE);
    const whiteConnected = isConnected(board, WHITE_PIECE);

    if (blackConnected && whiteConnected) {
      return lastPlayer;
    }
    if (blackConnected) return BLACK_PIECE;
    if (whiteConnected) return WHITE_PIECE;

    const blackCount = board.flat().filter((p) => p === BLACK_PIECE).length;
    const whiteCount = board.flat().filter((p) => p === WHITE_PIECE).length;

    if (blackCount === 1) return BLACK_PIECE;
    if (whiteCount === 1) return WHITE_PIECE;

    return null;
  };

  const makeMove = (from: Position, to: Position) => {
    const piece: Piece = board[from.row][from.col];
    const captured: boolean = board[to.row][to.col] !== null;

    setAnimatingPiece({ from, to, piece });

    setTimeout(() => {
      const newBoard: Board = board.map((row) => [...row]);

      let newBlackCaptures: number = blackCaptures;
      let newWhiteCaptures: number = whiteCaptures;

      if (captured) {
        if (currentPlayer === BLACK_PIECE) {
          newWhiteCaptures++;
          setWhiteCaptures(newWhiteCaptures);
        } else {
          newBlackCaptures++;
          setBlackCaptures(newBlackCaptures);
        }
        playCaptureSound();
      } else {
        playMoveSound();
      }

      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = EMPTY_CELL;

      const notation = `${positionToNotation(from)}${captured ? "x" : "-"}${positionToNotation(to)}`;
      const newMoveHistory = [...moveHistory, notation];

      setMoveHistory(newMoveHistory);
      setBoard(newBoard);
      setSelectedPiece(null);
      setValidMoves([]);
      setAnimatingPiece(null);
      setLastMove({ from, to });

      const winnerCheck = checkWinner(newBoard, currentPlayer);
      if (winnerCheck) {
        setWinner(winnerCheck);
        setGameOver(true);
        playWinSound();
        return newBoard;
      }

      const nextPlayer = currentPlayer === BLACK_PIECE ? WHITE_PIECE : BLACK_PIECE;
      const hasValidMoves = getAllValidMoves(newBoard, nextPlayer).length > 0;

      if (!hasValidMoves) {
        setWinner(currentPlayer);
        setGameOver(true);
        playWinSound();
        return newBoard;
      }

      setCurrentPlayer(nextPlayer);
      return newBoard;
    }, 300);
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || currentPlayer !== BLACK_PIECE || animatingPiece) return;

    if (selectedPiece) {
      const isValidMove = validMoves.some(
        (m) => m.row === row && m.col === col
      );
      if (isValidMove) {
        makeMove(selectedPiece, { row, col });
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else if (board[row][col] === BLACK_PIECE) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(board, { row, col }, BLACK_PIECE));
    }
  };

  const makeBotMove = () => {
    const allMoves = getAllValidMoves(board, WHITE_PIECE);
    if (allMoves.length === 0) {
      setWinner(BLACK_PIECE);
      setGameOver(true);
      playWinSound();
      return;
    }

    const selectedMove = bot.selectMove(board, allMoves);
    setTimeout(() => {
      makeMove(selectedMove.from, selectedMove.to);
    }, 500);
  };

  useEffect(() => {
    if (
      currentPlayer === WHITE_PIECE &&
      !gameOver &&
      !animatingPiece &&
      gameStarted
    ) {
      makeBotMove();
    }
  }, [currentPlayer, gameOver, animatingPiece, gameStarted]);

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setBot(instanciateBot());
    setCurrentPlayer(BLACK_PIECE);
    setSelectedPiece(null);
    setValidMoves([]);
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
    setAnimatingPiece(null);
    setBlackCaptures(0);
    setWhiteCaptures(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setLastMove(null);
    setGameStarted(false);
  };

  const isCellValid = (row: number, col: number) => {
    return validMoves.some((m) => m.row === row && m.col === col);
  };

  const isLightSquare = (row: number, col: number) => {
    return (row + col) % 2 === 0;
  };

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
    );
  };

  const getCellBackgroundColor = (row: number, col: number) => {
    if (isLastMoveSquare(row, col)) {
      return isLightSquare(row, col) ? "#F4C4A2" : "#E8A87C";
    }
    return isLightSquare(row, col) ? "#F0E5DD" : "#8C7A6B";
  };

  const getPiecePosition = (row: number, col: number) => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      const deltaRow = animatingPiece.to.row - animatingPiece.from.row;
      const deltaCol = animatingPiece.to.col - animatingPiece.from.col;
      return {
        transform: `translate(${deltaCol * 60}px, ${deltaRow * 60}px)`,
        transition: "transform 0.3s ease-in-out",
        zIndex: 100,
      };
    }
    return {};
  };

  const shouldShowPiece = (row: number, col: number) => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      return false;
    }
    return board[row][col] !== EMPTY_CELL;
  };

  const getPieceAtPosition = (row: number, col: number): Piece => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      return animatingPiece.piece;
    }
    return board[row][col];
  };

  return (
    <div className="container">
      <div className="game-header">
        <div className="stats-row">
          <div className="stat">
            <span className="stat-label">Dificuldade:</span>
            <span className="stat-value">{bot.getName()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Tempo:</span>
            <span className="stat-value">{formatTime(elapsedTime)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Jogadas:</span>
            <span className="stat-value">{moveHistory.length}</span>
          </div>
          <button
            className="small-button"
            style={{ marginLeft: "10px" }}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
        <div className="turn-indicator">
          <span className="turn-label">Turno:</span>
          <div
            className="turn-piece"
            style={{
              backgroundColor:
                currentPlayer === BLACK_PIECE ? "#2B2118" : "#FFF4ED",
              border: currentPlayer === WHITE_PIECE ? "2px solid #2B2118" : "none",
            }}
          />
          <span className="turn-text">
            {currentPlayer === BLACK_PIECE ? "Pretas (Você)" : "Brancas (Bot)"}
          </span>
        </div>
      </div>

      <div className="game-container">
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
              {[8, 7, 6, 5, 4, 3, 2, 1].map((num, idx) => (
                <div key={idx} className="label">
                  {num}
                </div>
              ))}
            </div>

            <div className="board">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className="cell"
                      style={{
                        backgroundColor: getCellBackgroundColor(
                          rowIndex,
                          colIndex
                        ),
                        cursor:
                          gameOver || animatingPiece
                            ? "default"
                            : (cell === BLACK_PIECE && currentPlayer === BLACK_PIECE) ||
                              isCellValid(rowIndex, colIndex)
                            ? "pointer"
                            : "default",
                        border:
                          selectedPiece?.row === rowIndex &&
                          selectedPiece?.col === colIndex
                            ? "3px solid #DC0E0E"
                            : "none",
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {shouldShowPiece(rowIndex, colIndex) && (
                        <div
                          className="piece"
                          style={{
                            backgroundColor:
                              getPieceAtPosition(rowIndex, colIndex) === BLACK_PIECE
                                ? "#2B2118"
                                : "#FFF4ED",
                            border:
                              getPieceAtPosition(rowIndex, colIndex) === WHITE_PIECE
                                ? "2px solid #2B2118"
                                : "none",
                            ...getPiecePosition(rowIndex, colIndex),
                          }}
                        />
                      )}
                      {isCellValid(rowIndex, colIndex) && (
                        <div className="valid-move-indicator" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="stats-container">
            <h3 className="section-title">Estatísticas</h3>
            <div className="capture-stats">
              <div className="capture-row">
                <div
                  className="small-piece"
                  style={{ backgroundColor: "#2B2118" }}
                />
                <span className="capture-label">Capturas:</span>
                <span className="capture-value">{whiteCaptures}</span>
              </div>
              <div className="capture-row">
                <div
                  className="small-piece"
                  style={{
                    backgroundColor: "#FFF4ED",
                    border: "2px solid #2B2118",
                  }}
                />
                <span className="capture-label">Capturas:</span>
                <span className="capture-value">{blackCaptures}</span>
              </div>
            </div>
            <div className="piece-counts">
              <div className="count-row">
                <span className="count-label">Peças Pretas:</span>
                <span className="count-value">
                  {board.flat().filter((p) => p === BLACK_PIECE).length}
                </span>
              </div>
              <div className="count-row">
                <span className="count-label">Peças Brancas:</span>
                <span className="count-value">
                  {board.flat().filter((p) => p === WHITE_PIECE).length}
                </span>
              </div>
            </div>
          </div>

          <div className="history-container">
            <h3 className="section-title">Histórico de Jogadas</h3>
            <div className="history-list">
              {moveHistory.length === 0 ? (
                <div className="empty-history">Nenhuma jogada ainda</div>
              ) : (
                moveHistory.map((move, idx) => (
                  <div key={idx} className="move-entry">
                    <span className="move-number">{idx + 1}.</span>
                    <span className="move-notation">{move}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="button-container">
            <button className="button" onClick={() => navigate("lobby")}>
              Novo Jogo
            </button>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-title">Fim de Jogo!</h2>
            <p className="modal-text">
              Vencedor: {winner === BLACK_PIECE ? "Pretas (Você)" : "Brancas (Bot)"}
            </p>
            <div className="final-stats">
              <div className="final-stat">
                <span className="final-stat-label">Dificuldade:</span>
                <span className="final-stat-value">{bot.getName()}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Tempo total:</span>
                <span className="final-stat-value">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Total de jogadas:</span>
                <span className="final-stat-value">{moveHistory.length}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Capturas (Pretas):</span>
                <span className="final-stat-value">{whiteCaptures}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Capturas (Brancas):</span>
                <span className="final-stat-value">{blackCaptures}</span>
              </div>
            </div>
            <button className="button" onClick={resetGame}>
              Novo Jogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameVsBot;
