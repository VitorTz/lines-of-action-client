import { useEffect, useState, useRef } from "react";
import {
  type Piece,
  BLACK_PIECE,
  WHITE_PIECE,
  EMPTY_CELL,
  type Difficulty,
} from "../types/game";
import { GameModel } from "../model/GameModel";
import { formatTime } from "../util/util";
import type { PageType } from "../types/general";
import { useGameBot } from "../hooks/useGameBot";
import {
  RotateCcw,
  LogOut,
  PlayCircle,
  Volume2,
  VolumeX,
  X,
  Cpu,
  User,
} from "lucide-react";
import "./GameVsBot.css";

const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;

const BOT_NAME: Map<Difficulty, string> = new Map([
  ["easy", "Fácil"],
  ["medium", "Médio"],
  ["hard", "Difícil"],
]);

interface GameVsBotProps {
  navigate: (page: PageType, data?: any) => void;
  difficulty?: Difficulty;
}

const GameVsBot = ({ navigate, difficulty = "easy" }: GameVsBotProps) => {
  const { gameState, actions, config } = useGameBot(difficulty);
  const {
    board,
    currentPlayer,
    selectedPiece,
    validMoves,
    animatingPiece,
    lastMove,
    gameOver,
    winner,
    isThinking,
    stats,
  } = gameState;

  // Estado para tamanho dinâmico da célula (Animação Responsiva)
  const [cellSize, setCellSize] = useState(60);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (gameOver) setIsModalOpen(true);
  }, [gameOver]);

  // Mede o tamanho real da célula para a animação
  useEffect(() => {
    const updateCellSize = () => {
      if (boardRef.current) {
        const cell = boardRef.current.querySelector(".cell");
        if (cell) {
          setCellSize(cell.getBoundingClientRect().width);
        }
      }
    };
    updateCellSize();
    window.addEventListener("resize", updateCellSize);
    return () => window.removeEventListener("resize", updateCellSize);
  }, []);

  const isCellValid = (row: number, col: number) =>
    validMoves.some((m) => m.row === row && m.col === col);

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
    );
  };

  const getCellBackgroundColor = (row: number, col: number) => {
    if (isLastMoveSquare(row, col))
      return isLightSquare(row, col) ? "#F4C4A2" : "#E8A87C";
    return isLightSquare(row, col) ? "#F0E5DD" : "#8C7A6B";
  };

  const getPieceStyle = (row: number, col: number) => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      const deltaRow = animatingPiece.to.row - animatingPiece.from.row;
      const deltaCol = animatingPiece.to.col - animatingPiece.from.col;
      return {
        // Usa cellSize dinâmico
        transform: `translate(${deltaCol * cellSize}px, ${deltaRow * cellSize}px)`,
        transition: "transform 0.3s ease-in-out",
        zIndex: 100,
      };
    }
    return {};
  };

  const shouldShowPiece = (row: number, col: number) => {
    return board[row][col] !== EMPTY_CELL;
  };

  const getPieceType = (row: number, col: number): Piece => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      return animatingPiece.piece;
    }
    return board[row][col] as Piece;
  };

  return (
    <div className="container">
      <div className="game-header">
        <div className="header-content">
          <div className="difficulty-badge">
            <Cpu size={16} />
            <span>Bot {BOT_NAME.get(difficulty)}</span>
          </div>

          <div className="turn-indicator">
            {currentPlayer === BLACK_PIECE ? (
              <span className="turn-active black-turn">
                <User size={16} /> Sua vez
              </span>
            ) : (
              <span className="turn-active white-turn">
                <Cpu size={16} /> Vez do Bot
                {isThinking && <span className="thinking-dots">...</span>}
              </span>
            )}
          </div>

          <div className="timer-badge">{formatTime(stats.elapsedTime)}</div>

          <button
            className="sound-toggle-btn"
            onClick={actions.toggleSound}
            title={config.soundEnabled ? "Desativar som" : "Ativar som"}
          >
            {config.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      <div className="game-main-layout">        
        <div className="board-section">
          <div className="board-wrapper">
          
            <div className="board-flex-row">
          
              {/* Grid do Tabuleiro */}
              <div className="board" ref={boardRef}>
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="row">
                    {row.map((cell, colIndex) => {
                      const isValid = isCellValid(rowIndex, colIndex);
                      const isSelected =
                        selectedPiece?.row === rowIndex &&
                        selectedPiece?.col === colIndex;

                      return (
                        <div
                          key={colIndex}
                          className="cell"
                          style={{
                            backgroundColor: getCellBackgroundColor(
                              rowIndex,
                              colIndex
                            ),
                            cursor:
                              gameOver || isThinking
                                ? "default"
                                : isValid ||
                                  (cell === BLACK_PIECE &&
                                    currentPlayer === BLACK_PIECE)
                                ? "pointer"
                                : "default",
                            boxShadow: isSelected
                              ? "inset 0 0 0 3px #DC0E0E"
                              : "none",
                          }}
                          onClick={() =>
                            actions.onCellClick(rowIndex, colIndex)
                          }
                        >
                          {shouldShowPiece(rowIndex, colIndex) && (
                            <div
                              className="piece"
                              style={{
                                backgroundColor:
                                  getPieceType(rowIndex, colIndex) ===
                                  BLACK_PIECE
                                    ? "#2B2118"
                                    : "#FFF4ED",
                                border:
                                  getPieceType(rowIndex, colIndex) ===
                                  WHITE_PIECE
                                    ? "2px solid #2B2118"
                                    : "none",
                                ...getPieceStyle(rowIndex, colIndex),
                              }}
                            />
                          )}
                          {isValid && <div className="valid-move-indicator" />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="stats-card">
            <h3 className="card-title">Peças no Jogo</h3>
            <div className="piece-counts">
              <div className="count-row">
                <span className="count-label">
                  <div className="indicator-dot black"></div> Você (Pretas)
                </span>
                <span className="count-value">
                  {board.flat().filter((p) => p === BLACK_PIECE).length}
                </span>
              </div>
              <div className="count-row">
                <span className="count-label">
                  <div className="indicator-dot white"></div> Bot (Brancas)
                </span>
                <span className="count-value">
                  {board.flat().filter((p) => p === WHITE_PIECE).length}
                </span>
              </div>
            </div>
          </div>

          <div className="history-card">
            <h3 className="card-title">Histórico</h3>
            <div className="history-list">
              {stats.moveHistory.length === 0 ? (
                <div className="empty-history">Início do jogo</div>
              ) : (
                stats.moveHistory.map((move, idx) => (
                  <div key={idx} className="move-entry">
                    <span className="move-idx">{idx + 1}.</span>
                    <span className="move-text">{move}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={actions.resetGame}>
              <RotateCcw size={18} /> Reiniciar
            </button>
            <button
              className="btn btn-outlined"
              onClick={() => navigate("lobby")}
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        </div>
      </div>

    
      {gameOver && isModalOpen && (
        <div className="modal-overlay">
          <div className="game-over-card" style={{ position: "relative" }}>
            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} />
            </button>

            <h2>Fim de Jogo!</h2>
            <p>
              Vencedor:{" "}
              <strong>
                {winner === BLACK_PIECE ? "Você 🏆" : "Bot (Brancas)"}
              </strong>
            </p>

            <div className="modal-stats-summary">
              <div className="summary-item">
                <span>Tempo:</span> <strong>{formatTime(stats.elapsedTime)}</strong>
              </div>
              <div className="summary-item">
                <span>Jogadas:</span> <strong>{stats.moveHistory.length}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn btn-replay"
                onClick={() => {
                  actions.resetGame();
                  setIsModalOpen(false);
                }}
              >
                <PlayCircle size={18} /> Jogar Novamente
              </button>

              <button
                className="modal-btn btn-exit"
                onClick={() => navigate("lobby")}
              >
                <LogOut size={18} /> Voltar ao Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameVsBot;