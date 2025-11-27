import { useEffect, useState, useRef } from "react";
import type { PageType } from "../types/general";
import { useAuth } from "../components/auth/AuthContext";
import VideoChat from "../components/VideoChat";
import GameChat from "../components/GameChat";
import {
  MessageSquare,
  History,
  BarChart2,
  Flag,
  PlayCircle,
  LogOut,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatTime } from "../util/util";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import {
  type Piece,
  BLACK_PIECE,
  WHITE_PIECE,
  EMPTY_CELL,
} from "../types/game";
import "./GameVsPlayer.css";

const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;

interface GameVsPlayerProps {
  navigate: (page: PageType, data?: any) => void;
  data: {
    gameId: string;
    color: string;
  };
}

const GameVsPlayer = ({ navigate, data }: GameVsPlayerProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "stats">(
    "chat"
  );

  // Estado para controlar o tamanho da peça para animação
  const [cellSize, setCellSize] = useState(60);
  const boardRef = useRef<HTMLDivElement>(null);

  const { gameState, actions } = useMultiplayerGame(
    data.gameId,
    data.color,
    navigate
  );

  const {
    board,
    isMyTurn,
    opponentName,
    winner,
    gameOver,
    selectedPiece,
    validMoves,
    animatingPiece,
    lastMove,
    stats,
    currentPlayer,
  } = gameState;

  const myPiece = data.color === "black" ? BLACK_PIECE : WHITE_PIECE;

  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSurrenderModalOpen, setIsSurrenderModalOpen] = useState(false);

  useEffect(() => {
    if (gameOver) {
      setIsModalOpen(true);
      setIsSurrenderModalOpen(false);
    }
  }, [gameOver]);

  // Para calcular tamanho da peça do tabuleiro
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

  // Atualizado para usar cellSize dinâmico
  const getPieceStyle = (row: number, col: number) => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      const deltaRow = animatingPiece.to.row - animatingPiece.from.row;
      const deltaCol = animatingPiece.to.col - animatingPiece.from.col;
      return {
        // Usa a variável cellSize calculada em vez do hardcoded 60
        transform: `translate(${deltaCol * cellSize}px, ${
          deltaRow * cellSize
        }px)`,
        transition: "transform 0.3s ease-in-out",
        zIndex: 100,
      };
    }
    return {};
  };

  const getPieceAtPosition = (row: number, col: number): Piece => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      return animatingPiece.piece;
    }
    return board[row][col] as Piece;
  };

  const shouldShowPiece = (row: number, col: number) => {
    if (
      animatingPiece &&
      animatingPiece.from.row === row &&
      animatingPiece.from.col === col
    ) {
      return true;
    }
    return board[row][col] !== EMPTY_CELL;
  };

  return (
    <div className="game-layout">
      <div className="game-main-area">
        {/* Header */}
        <div className="game-compact-header">
          <div >
            <div className="match-versus">
              <span className="player-name">
                <div
                  className={data.color === "white" ? "white-dot" : "black-dot"}
                ></div>
                {user?.username} (você)
              </span>
              <span className="versus-text">VS</span>
              <span className="player-name">
                <div
                  className={data.color === "white" ? "black-dot" : "white-dot"}
                ></div>
                {opponentName}
              </span>
            </div>
            <div
              className={`turn-badge ${isMyTurn ? "my-turn" : "opponent-turn"}`}
            >
              {isMyTurn ? "Sua Vez!" : "Vez do Oponente"}
            </div>
          </div>

          <div className="game-timer">{formatTime(stats.elapsedTime)}</div>
        </div>

        {/* Board */}
        <div className="board-container">
          <div className="board-wrapper">
            {/* Adicionado a ref aqui para medir as células */}
            <div className="board-grid" ref={boardRef}>
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
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
                            gameOver || animatingPiece || !isMyTurn
                              ? "default"
                              : (cell === myPiece &&
                                  currentPlayer === myPiece) ||
                                isValid
                              ? "pointer"
                              : "default",
                          borderColor: isSelected ? "#DC0E0E" : "transparent",
                          // Adiciona borda interna para seleção visível
                          boxShadow: isSelected
                            ? "inset 0 0 0 3px #DC0E0E"
                            : "none",
                        }}
                        onClick={() =>
                          actions.handleCellClick(rowIndex, colIndex)
                        }
                      >
                        {shouldShowPiece(rowIndex, colIndex) && (
                          <div
                            className="piece"
                            style={{
                              backgroundColor:
                                getPieceAtPosition(rowIndex, colIndex) ===
                                BLACK_PIECE
                                  ? "#2B2118"
                                  : "#FFF4ED",
                              border:
                                getPieceAtPosition(rowIndex, colIndex) ===
                                WHITE_PIECE
                                  ? "2px solid #2B2118"
                                  : "none",
                              ...getPieceStyle(rowIndex, colIndex),
                            }}
                          />
                        )}
                        {isValid && <div className="valid-move-dot" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="game-sidebar">
        <div style={{ backgroundColor: "transparent" }}>
          <VideoChat gameId={data.gameId} myColor={data.color} />
        </div>

        <div className="sidebar-tabs">
          <button
            className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
            title="Chat"
          >
            <MessageSquare size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
            title="Histórico"
          >
            <History size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
            title="Estatísticas"
          >
            <BarChart2 size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          {activeTab === "chat" && (
            <div className="tab-pane chat-pane">
              <GameChat gameId={data.gameId} playerId={user?.id || ""} />
            </div>
          )}

          {activeTab === "history" && (
            <div className="tab-pane history-pane">
              <h3>Histórico</h3>
              <div className="history-list-compact">
                {stats.moveHistory.length === 0 ? (
                  <div className="empty-state">Início do jogo</div>
                ) : (
                  stats.moveHistory.map((move, idx) => (
                    <div key={idx} className="history-item">
                      <span className="move-idx">{idx + 1}.</span>
                      <span className="move-text">{move}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="tab-pane stats-pane">
              <h3>Capturas</h3>
              <div className="stat-row">
                <div className="piece-icon white-piece"></div>
                <span>
                  Brancas capturadas: <strong>{stats.blackCaptures}</strong>
                </span>
              </div>
              <div className="stat-row">
                <div className="piece-icon black-piece"></div>
                <span>
                  Pretas capturadas: <strong>{stats.whiteCaptures}</strong>
                </span>
              </div>

              <hr className="divider" />

              <h3>Peças em Jogo</h3>
              <div className="stat-row">
                <span>
                  Pretas: {board.flat().filter((p) => p === BLACK_PIECE).length}
                </span>
              </div>
              <div className="stat-row">
                <span>
                  Brancas:{" "}
                  {board.flat().filter((p) => p === WHITE_PIECE).length}
                </span>
              </div>
            </div>
          )}
        </div>

        {!gameOver && (
          <div className="sidebar-footer">
            <button
              className="surrender-btn"
              onClick={() => setIsSurrenderModalOpen(true)}
            >
              <Flag size={16} /> Desistir
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL DE FIM DE JOGO --- */}
      {gameOver && isModalOpen && (
        <div className="modal-overlay">
          <div className="game-over-card">
            {/* Botão de Fechar */}
            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              title="Fechar janela"
            >
              <X size={24} />
            </button>

            <h2>Fim de Jogo!</h2>
            <p>
              Vencedor:{" "}
              <strong>{winner === user?.username ? "Você 🏆" : winner}</strong>
            </p>

            <div className="modal-actions">
              {/* Botão Replay */}
              <button
                className="modal-btn btn-replay"
                onClick={actions.viewReplay}
              >
                <PlayCircle size={18} /> Ver Replay
              </button>

              {/* Botão Sair */}
              <button className="modal-btn btn-exit" onClick={actions.exitGame}>
                <LogOut size={18} /> Sair para o Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE DESISTÊNCIA (NOVO) --- */}
      {isSurrenderModalOpen && !gameOver && (
        <div className="modal-overlay">
          <div className="game-over-card">
            <button
              className="modal-close-btn"
              onClick={() => setIsSurrenderModalOpen(false)}
              title="Fechar janela"
            >
              <X size={24} />
            </button>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <AlertTriangle size={48} color="#ef4444" />
            </div>

            <h2>Desistir da Partida?</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Isso contará como uma derrota e você perderá pontos de rank. Tem
              certeza?
            </p>

            <div className="modal-actions">
              <button
                className="modal-btn btn-primary"
                onClick={() => {
                  actions.handleSurrender();
                  setIsSurrenderModalOpen(false);
                }}
              >
                <Flag size={18} /> Confirmar Desistência
              </button>

              <button
                className="modal-btn btn-secondary"
                onClick={() => setIsSurrenderModalOpen(false)}
              >
                Voltar ao Jogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameVsPlayer;