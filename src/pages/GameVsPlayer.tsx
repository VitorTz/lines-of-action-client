import {
  type Piece,
  type Board,
  type Position,
  BLACK_PIECE,
  EMPTY_CELL,
  WHITE_PIECE
} from "../types/game";
import { useState, useEffect, useRef } from "react";
import { formatTime, generateNewGameBoard } from "../util/util";
import type { PageType } from "../types/general";
import "./GameVsPlayer.css"; // Note que agora usamos um CSS específico
import { useSocket } from "../socket/useSocket";
import { useAuth } from "../components/auth/AuthContext";
import { useNotification } from "../components/notification/NotificationContext";
import VideoChat from "../components/VideoChat";
import GameChat from "../components/GameChat";
import { MessageSquare, History, BarChart2, Flag, ChevronLeft } from "lucide-react";

const INITIAL_BOARD: Board = generateNewGameBoard();

interface GameVsPlayerProps {
  navigate: (page: PageType, data?: any) => void;
  data: {
    gameId: string;
    color: string;
  };
}

const GameVsPlayer = ({ navigate, data }: GameVsPlayerProps) => {
    
  const socket = useSocket();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const gameId: string = data.gameId;
  const myColor: string = data.color;
  
  // Estado da UI (Abas)
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'stats'>('chat');

  const [opponentName, setOpponentName] = useState<string>("Oponente");
  const [isMyTurn, setIsMyTurn] = useState(myColor === "black");
  const [gameStarted, setGameStarted] = useState(false);
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
  const [lastMove, setLastMove] = useState<{
    from: Position;
    to: Position;
  } | null>(null);

  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const audioContextRef = useRef<AudioContext | null>(null);

  const myPiece = myColor === "black" ? BLACK_PIECE : WHITE_PIECE;

  useEffect(() => {
    if (typeof window !== "undefined" && window.AudioContext) {
      audioContextRef.current = new AudioContext();
    }

    if (user) {
      socket.emit("join-game", { gameId, playerId: user.id });
    }

    socket.on("game-state", handleGameState);
    socket.on("move-made", handleMoveMade);
    socket.on("game-over", handleGameOver);
    socket.on("opponent-disconnected-game", handleOpponentDisconnected);
    socket.on("error", (data) => {
      addNotification({ title: "Erro", message: data.message, type: "error" });
    });

    return () => {
      socket.off("game-state");
      socket.off("move-made");
      socket.off("game-over");
      socket.off("opponent-disconnected-game");
      socket.off("error");
    };
  }, []);

  useEffect(() => {
    if (!gameOver && gameStarted) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, gameOver, gameStarted]);

  // Handlers (mantidos idênticos)
  const handleGameState = (data: any) => {
    setBoard(data.board);
    setCurrentPlayer(data.turn === "black" ? BLACK_PIECE : WHITE_PIECE);
    setIsMyTurn(data.turn === myColor);
    setOpponentName(myColor == 'black' ? data.playerWhiteUsername : data.playerBlackUsername)
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const handleMoveMade = (data: any) => {
    const { from, to, captured, player, board: newBoard, turn } = data;
    const piece = board[from.row][from.col] as Piece;
    setAnimatingPiece({ from, to, piece });

    setTimeout(() => {
      setBoard(newBoard);
      setCurrentPlayer(turn === "black" ? BLACK_PIECE : WHITE_PIECE);
      setIsMyTurn(turn === myColor);
      setSelectedPiece(null);
      setValidMoves([]);
      setAnimatingPiece(null);
      setLastMove({ from, to });

      if (captured) {
        if (player === "black") setWhiteCaptures((prev) => prev + 1);
        else setBlackCaptures((prev) => prev + 1);
        playCaptureSound();
      } else {
        playMoveSound();
      }

      const notation = `${positionToNotation(from)}${captured ? "x" : "-"}${positionToNotation(to)}`;
      setMoveHistory((prev) => [...prev, notation]);
    }, 300);
  };

  const handleGameOver = (data: any) => {
    setGameOver(true);
    setWinner(data.winner === "black" ? BLACK_PIECE : WHITE_PIECE);
    playWinSound();
    if (data.reason === "surrender") {
      addNotification({
        title: "Jogo Finalizado",
        message: data.winner === myColor ? "Seu oponente desistiu!" : "Você desistiu da partida",
        type: "info",
      });
    }
  };

  const handleOpponentDisconnected = () => {
    addNotification({ title: "Oponente Desconectado", message: "Seu oponente se desconectou da partida", type: "warning" });
  };

  // Lógica de Som e Jogo (mantida idêntica para não quebrar lógica)
  const playLocalSound = (path: string) => {
    const audio = new Audio(path);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const playSound = (frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!audioContextRef.current) return;
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const playCaptureSound = () => playLocalSound("songs/capture.mp3");
  const playMoveSound = () => playLocalSound("songs/move-self.mp3");
  const playWinSound = () => {
    playSound(523, 0.2); setTimeout(() => playSound(659, 0.2), 200); setTimeout(() => playSound(784, 0.3), 400);
  };

  const positionToNotation = (pos: Position): string => `${columns[pos.col]}${8 - pos.row}`;

  const countPiecesInLine = (board: Board, from: Position, direction: [number, number]): number => {
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

  const getValidMoves = (board: Board, from: Position, player: Piece): Position[] => {
    const moves: Position[] = [];
    const directions: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of directions) {
      const distance = countPiecesInLine(board, from, [dr, dc]);
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
  };

  const makeMove = (from: Position, to: Position) => {
    if (!user) return;
    const captured: boolean = board[to.row][to.col] !== EMPTY_CELL;
    socket.emit("make-move", { gameId, playerId: user.id, from, to, captured });
    
    const newBoard: Board = board.map((row) => [...row]);
    const piece = board[from.row][from.col];
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = EMPTY_CELL;
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || !isMyTurn || animatingPiece) return;
    if (selectedPiece) {
      const isValidMove = validMoves.some((m) => m.row === row && m.col === col);
      if (isValidMove) {
        makeMove(selectedPiece, { row, col });
        setSelectedPiece(null);
        setValidMoves([]);
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else if (board[row][col] === myPiece) {
      setSelectedPiece({ row, col });
      setValidMoves(getValidMoves(board, { row, col }, myPiece));
    }
  };

  const handleSurrender = () => {
    if (!user) return;
    if (window.confirm("Tem certeza que deseja desistir?")) {
      socket.emit("surrender", { gameId, playerId: user.id });
    }
  };

  const exitGame = () => navigate("lobby");

  const isCellValid = (row: number, col: number) => validMoves.some((m) => m.row === row && m.col === col);
  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;
  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return ((lastMove.from.row === row && lastMove.from.col === col) || (lastMove.to.row === row && lastMove.to.col === col));
  };

  const getCellBackgroundColor = (row: number, col: number) => {
    if (isLastMoveSquare(row, col)) return isLightSquare(row, col) ? "#F4C4A2" : "#E8A87C";
    return isLightSquare(row, col) ? "#F0E5DD" : "#8C7A6B";
  };

  const getPiecePosition = (row: number, col: number) => {
    if (animatingPiece && animatingPiece.from.row === row && animatingPiece.from.col === col) {
      const deltaRow = animatingPiece.to.row - animatingPiece.from.row;
      const deltaCol = animatingPiece.to.col - animatingPiece.from.col;
      return { transform: `translate(${deltaCol * 60}px, ${deltaRow * 60}px)`, transition: "transform 0.3s ease-in-out", zIndex: 100 };
    }
    return {};
  };

  const shouldShowPiece = (row: number, col: number) => {
    if (animatingPiece && animatingPiece.from.row === row && animatingPiece.from.col === col) return false;
    return board[row][col] !== EMPTY_CELL;
  };

  const getPieceAtPosition = (row: number, col: number): Piece => {
    if (animatingPiece && animatingPiece.from.row === row && animatingPiece.from.col === col) return animatingPiece.piece;
    return board[row][col] as Piece;
  };

  return (
    <div className="game-layout">
      
      {/* Área Principal (Header + Board) */}
      <div className="game-main-area">
        
        {/* Compact Header */}
        <div className="game-compact-header">
          <button className="back-btn" onClick={exitGame}>
            <ChevronLeft size={20}/>
          </button>
          
          <div className="match-versus">
            <span className="player-name">{user?.username} (Você)</span>
            <span className="versus-text">VS</span>
            <span className="player-name">{opponentName}</span>
          </div>

          <div className="game-timer">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Board Container */}
        <div className="board-container">
          
          {/* Indicador de Turno Flutuante */}
          <div className={`turn-badge ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
            {isMyTurn ? "Sua Vez!" : "Vez do Oponente"}
          </div>

          <div className="board-wrapper">
            {/* Labels omitidos ou simplificados para limpar o design, mantendo apenas a borda com coordenadas se quiser */}
            <div className="board-grid">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className="cell"
                      style={{
                        backgroundColor: getCellBackgroundColor(rowIndex, colIndex),
                        cursor: gameOver || animatingPiece || !isMyTurn ? "default" : (cell === myPiece && currentPlayer === myPiece) || isCellValid(rowIndex, colIndex) ? "pointer" : "default",
                        borderColor: selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex ? "#DC0E0E" : "transparent"
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {shouldShowPiece(rowIndex, colIndex) && (
                        <div
                          className="piece"
                          style={{
                            backgroundColor: getPieceAtPosition(rowIndex, colIndex) === BLACK_PIECE ? "#2B2118" : "#FFF4ED",
                            border: getPieceAtPosition(rowIndex, colIndex) === WHITE_PIECE ? "2px solid #2B2118" : "none",
                            ...getPiecePosition(rowIndex, colIndex),
                          }}
                        />
                      )}
                      {isCellValid(rowIndex, colIndex) && <div className="valid-move-dot" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar (Direita) */}
      <div className="game-sidebar">
        
        {/* Área do Vídeo (Sempre Visível no Topo) */}
        <div className="video-section">
          <VideoChat gameId={gameId} myColor={myColor} />
        </div>

        {/* Navegação por Abas */}
        <div className="sidebar-tabs">
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} 
            onClick={() => setActiveTab('chat')}
            title="Chat"
          >
            <MessageSquare size={20} />
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
            title="Histórico"
          >
            <History size={20} />
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} 
            onClick={() => setActiveTab('stats')}
            title="Estatísticas"
          >
            <BarChart2 size={20} />
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="sidebar-content">
          
          {/* Aba Chat */}
          {activeTab === 'chat' && (
            <div className="tab-pane chat-pane">
              <GameChat gameId={gameId} playerId={user?.id || ''} />
            </div>
          )}

          {/* Aba Histórico */}
          {activeTab === 'history' && (
            <div className="tab-pane history-pane">
              <h3>Histórico</h3>
              <div className="history-list-compact">
                {moveHistory.length === 0 ? (
                  <div className="empty-state">Início do jogo</div>
                ) : (
                  moveHistory.map((move, idx) => (
                    <div key={idx} className="history-item">
                      <span className="move-idx">{idx + 1}.</span>
                      <span className="move-text">{move}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Aba Estatísticas */}
          {activeTab === 'stats' && (
            <div className="tab-pane stats-pane">
              <h3>Capturas</h3>
              <div className="stat-row">
                <div className="piece-icon white-piece"></div>
                <span>Brancas capturadas: <strong>{blackCaptures}</strong></span>
              </div>
              <div className="stat-row">
                <div className="piece-icon black-piece"></div>
                <span>Pretas capturadas: <strong>{whiteCaptures}</strong></span>
              </div>
              
              <hr className="divider"/>
              
              <h3>Peças em Jogo</h3>
              <div className="stat-row">
                <span>Pretas: {board.flat().filter((p) => p === BLACK_PIECE).length}</span>
              </div>
              <div className="stat-row">
                <span>Brancas: {board.flat().filter((p) => p === WHITE_PIECE).length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Desistir (Rodapé da Sidebar) */}
        <div className="sidebar-footer">
          <button className="surrender-btn" onClick={handleSurrender}>
            <Flag size={16} /> Desistir
          </button>
        </div>
      </div>

      {/* Modal de Game Over */}
      {gameOver && (
        <div className="modal-overlay">
          <div className="game-over-card">
            <h2>Fim de Jogo!</h2>
            <p>
              Vencedor: {winner === myPiece ? "Você venceu!" : "Oponente venceu"}
            </p>
            <div className="modal-actions">
              <button className="btn-primary" onClick={exitGame}>Voltar ao Lobby</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameVsPlayer;