import { useEffect, useState, useRef, useCallback } from "react";
import type { GameHistory, Move } from "../types/game";
import { linesApi } from "../api/linesApi";
import { generateNewGameBoard } from "../util/util";
import {
  BLACK_PIECE,
  WHITE_PIECE,
  EMPTY_CELL,
  type Board,
} from "../types/game";
import "./GameReview.css";
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
  Circle,
  Trophy,
  Calendar,
  Clock,
  LogOut,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cellSize, setCellSize] = useState(60);

  const playInterval = useRef<any>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // 1. REF para a lista de histórico (para o scroll)
  const historyListRef = useRef<HTMLDivElement>(null);
  
  const { addNotification } = useNotification();

  const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

  // Calcula tamanho da célula responsiva
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
  }, [gameHistory]);

  useEffect(() => {
    const init = async () => {
      try {
        const g = await linesApi.game.getGameHistory(gameId);
        setGameHistory(g);
        setBoard(INITIAL_BOARD);
        updatePieceCounts(INITIAL_BOARD, []);
      } catch (e) {
        addNotification({
          title: "Partida não encontrada",
          type: "error",
        });
        navigate("lobby");
      }
    };
    init();
  }, [gameId]);

  const updatePieceCounts = (b: Board, moves: Move[]) => {
    let black = 0;
    let white = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (b[r][c] === BLACK_PIECE) black++;
        if (b[r][c] === WHITE_PIECE) white++;
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

  // Envolvi em useCallback para usar nas dependências do useEffect do teclado
  const goToMove = useCallback((index: number) => {
    if (!gameHistory) return;
    const capped = Math.min(Math.max(index, 0), gameHistory.gameMoves.length);
    setCurrentMoveIndex(capped);
    setBoard(applyMoveListUpTo(capped));
  }, [gameHistory]);

  const nextMove = useCallback(() => goToMove(currentMoveIndex + 1), [currentMoveIndex, goToMove]);
  const prevMove = useCallback(() => goToMove(currentMoveIndex - 1), [currentMoveIndex, goToMove]);
  const firstMove = () => goToMove(0);
  const lastMove = () => gameHistory && goToMove(gameHistory.gameMoves.length);

  // --- NOVO: Lógica de Scroll Automático ---
  useEffect(() => {
    if (historyListRef.current) {
      // Busca o elemento ativo dentro da lista
      const activeElement = historyListRef.current.querySelector('.active-move');
      
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest', // Importante: mantêm o scroll mínimo necessário, evitando pular a página toda
        });
      }
    }
  }, [currentMoveIndex]); // Executa sempre que o índice muda

  // --- NOVO: Lógica de Teclado ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evita conflito se o usuário estiver digitando em algum input (se houver no futuro)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowLeft":
          prevMove();
          break;
        case "ArrowRight":
          nextMove();
          break;
        case "ArrowUp":
          firstMove(); // Opcional: Vai para o início
          break;
        case "ArrowDown":
          lastMove(); // Opcional: Vai para o fim
          break;
        case " ":
        case "Spacebar": // IE11 compatibility
          e.preventDefault(); // Evita scroll da página com espaço
          setIsPlaying((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevMove, nextMove, firstMove, lastMove]); // Dependências atualizadas


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
  }, [isPlaying, currentMoveIndex, gameHistory, nextMove]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!gameHistory) return <div className="loading-state">Carregando replay...</div>;

  const isWhiteWinner =
    (gameHistory.winner as any)._id === (gameHistory.playerWhite as any)._id;
  const isBlackWinner =
    (gameHistory.winner as any)._id === (gameHistory.playerBlack as any)._id;

  return (
    <div className="game-layout">
      <div className="game-main-area">
        
        {/* MATCH HEADER CARD */}
        <div className="game-compact-header review-header">
          {/* Player White */}
          <div className={`player-info ${isWhiteWinner ? "winner-glow" : ""}`} style={{flexDirection: 'row', textAlign: 'left'}}>
             <div className="avatar-wrapper">
               <img src={gameHistory.playerWhite.perfilImageUrl} className="player-avatar" alt="White Player" />
               <div className="piece-indicator white-indicator"><Circle size={10}/></div>
             </div>
             <div className="player-text">
                <span className="p-name">{gameHistory.playerWhite.username}</span>
                <span className="p-rank">Rank {gameHistory.playerWhite.rank}</span>
             </div>
             {isWhiteWinner && <Trophy className="trophy-icon" size={16} />}
          </div>

          <div className="match-meta">
             <div className="vs-text">VS</div>
             <div className="meta-row">
               <Calendar size={14} /> {formatDate(gameHistory.gameCreatedAt as any)}
             </div>
             <div className="meta-row">
               <Clock size={14} /> {gameHistory.gameMoves.length} lances
             </div>
          </div>

          {/* Player Black */}
          <div className={`player-info ${isBlackWinner ? "winner-glow" : ""}`} style={{flexDirection: 'row-reverse', textAlign: 'right'}}>
             <div className="avatar-wrapper">
               <img src={gameHistory.playerBlack.perfilImageUrl} className="player-avatar" alt="Black Player" />
               <div className="piece-indicator black-indicator"><CircleDot size={10} color="#fff"/></div>
             </div>
             <div className="player-text">
                <span className="p-name">{gameHistory.playerBlack.username}</span>
                <span className="p-rank">Rank {gameHistory.playerBlack.rank}</span>
             </div>
             {isBlackWinner && <Trophy className="trophy-icon" size={16} />}
          </div>
        </div>

        {/* BOARD AREA */}
        <div className="board-container">
          <div className="board-wrapper">             

             <div className="board-row-flex">               

               <div className="board" ref={boardRef}>
                  {board.map((row, r) => (
                    <div key={r} className="row">
                      {row.map((cell, c) => (
                        <div
                          key={c}
                          className="cell"
                          style={{
                            backgroundColor: getCellColor(r, c),
                            boxShadow: highlightLastMove(r, c) ? "inset 0 0 0 3px #DC0E0E" : "none",
                          }}
                        >
                          {cell !== EMPTY_CELL && (
                            <div
                              className="piece"
                              style={{
                                backgroundColor: cell === BLACK_PIECE ? "#2B2118" : "#FFF4ED",
                                border: cell === WHITE_PIECE ? "2px solid #2B2118" : "none",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="game-sidebar">
        {/* Controles de Reprodução */}
        <div className="sidebar-section controls-section">
           <div className="control-row">
              <button className="control-btn" onClick={firstMove} title="Início (Seta Cima)"><ChevronsLeft size={20}/></button>
              <button className="control-btn" onClick={prevMove} title="Voltar (Seta Esq)"><ChevronLeft size={20}/></button>
              <button className="control-btn play-btn" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pausar (Espaço)" : "Reproduzir (Espaço)"}>
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button className="control-btn" onClick={nextMove} title="Avançar (Seta Dir)"><ChevronRight size={20}/></button>
              <button className="control-btn" onClick={lastMove} title="Fim (Seta Baixo)"><ChevronsRight size={20}/></button>
           </div>
           
           <div className="progress-info">
              Lance {currentMoveIndex} / {gameHistory.gameMoves.length}
           </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="sidebar-section stats-section">
           <div className="stat-pill black-pill">
              <CircleDot size={14} /> <span>Pretas: {blackCount}</span>
           </div>
           <div className="stat-pill white-pill">
              <Circle size={14} /> <span>Brancas: {whiteCount}</span>
           </div>
        </div>

        {/* Histórico Scrollável com REF adicionada */}
        <div className="sidebar-content review-history" ref={historyListRef}>
           {gameHistory.gameMoves.map((m: any, i: number) => {
              const from = `${columns[m.from.col]}${8 - m.from.row}`;
              const to = `${columns[m.to.col]}${8 - m.to.row}`;
              const notation = `${from}${m.captured ? "x" : "-"}${to}`;
              const active = i === currentMoveIndex - 1;

              return (
                <div
                  key={i}
                  // A classe 'active-move' é usada pelo useEffect para o scroll
                  className={`history-item ${active ? 'active-move' : ''}`}
                  onClick={() => goToMove(i + 1)}
                >
                  <span className="move-idx">{i + 1}.</span>
                  <span className="move-text">{notation}</span>
                </div>
              );
            })}
        </div>

        <div className="sidebar-footer">
           <button className="surrender-btn" onClick={() => navigate("match-history")}>
             <LogOut size={18} /> Voltar
           </button>
        </div>
      </div>
    </div>
  );
};

export default GameReview;