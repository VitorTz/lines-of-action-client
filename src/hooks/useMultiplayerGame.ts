import { useState, useEffect, useCallback, useRef } from "react";
import { 
  type Board, 
  type Position, 
  type Piece, 
  BLACK_PIECE, 
  WHITE_PIECE, 
  EMPTY_CELL 
} from "../types/game";
import { useSocket } from "../socket/useSocket";
import { useAuth } from "../components/auth/AuthContext";
import { useNotification } from "../components/notification/NotificationContext";
import { useGameChat } from "../context/GameChatContext";
import { useGameSounds } from "./useGameSounds";
import { generateNewGameBoard } from "../util/util";
import { GameModel } from "../model/GameModel";
import type { PageType } from "../types/general";
import { useGlobal } from "../context/GlobalContext";


const INITIAL_BOARD = generateNewGameBoard();


export const useMultiplayerGame = (
  gameId: string, 
  myColor: string, 
  navigate: (page: PageType, data?: any) => void
) => {
  
  const socket = useSocket();
  const { user } = useAuth();
  const { setIsPlaying, setGameId } = useGlobal()
  const { addNotification } = useNotification();
  const { clearMessages } = useGameChat();
  const { playMove, playCapture, playWin } = useGameSounds();

  // Estados
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(myColor === "black");
  const [currentPlayer, setCurrentPlayer] = useState<Piece>(BLACK_PIECE);
  const [opponentName, setOpponentName] = useState<string>("Oponente");
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  
  // UI / Animação
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [animatingPiece, setAnimatingPiece] = useState<{ from: Position; to: Position; piece: Piece } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  // Stats
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [blackCaptures, setBlackCaptures] = useState(0);
  const [whiteCaptures, setWhiteCaptures] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  const myPiece = myColor === "black" ? BLACK_PIECE : WHITE_PIECE;

  // Timer
  useEffect(() => {
    if (!gameOver && gameStarted) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameOver, gameStarted]);
  
  useEffect(() => {
    if (user) {
      socket.emit("join-game", { gameId, playerId: user.id });
    }
    setIsPlaying(true)
    setGameId(gameId)
    clearMessages();

    const handleGameState = (data: any) => {
      setBoard(data.board);
      setCurrentPlayer(data.turn === "black" ? BLACK_PIECE : WHITE_PIECE);
      setIsMyTurn(data.turn === myColor);
      setOpponentName(myColor === 'black' ? data.playerWhiteUsername : data.playerBlackUsername);
      setGameStarted(true);
      startTimeRef.current = Date.now();
    };

    const handleMoveMade = (data: any) => {
      const { from, to, captured, player, board: newBoard, turn } = data;
            
      const pieceMoving = player === 'black' ? BLACK_PIECE : WHITE_PIECE;
      
      // 1. Inicia animação
      setAnimatingPiece({ from, to, piece: pieceMoving });

      // 2. Consolida o movimento após delay da animação (300ms)
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
          playCapture();
        } else {
          playMove();
        }

        const notation = GameModel.playNotation(from, to, captured);
        setMoveHistory((prev) => [...prev, notation]);
      }, 300);
    };

    const handleGameOverEvent = (data: { winnerUsername: string, gameId: string, reason: string }) => {
      setGameOver(true);
      setWinner(data.winnerUsername);
      playWin();
      setIsPlaying(false)
      setGameId(null)
      if (data.reason === "surrender") {
        addNotification({
          title: "Jogo Finalizado por desistência",
          message: `Vencedor: ${data.winnerUsername}`,
          type: "info",
        });
      }
    };

    const handleOpponentDisconnected = () => {
      setIsPlaying(false)
      setGameId(null)
      addNotification({ 
        title: "Oponente Desconectado", 
        message: "Seu oponente se desconectou da partida", 
        type: "warning" 
      });
    };

    socket.on("game-state", handleGameState);
    socket.on("move-made", handleMoveMade);
    socket.on("game-over", handleGameOverEvent);
    socket.on("opponent-disconnected-game", handleOpponentDisconnected);

    return () => {
      socket.off("game-state");
      socket.off("move-made");
      socket.off("game-over");
      socket.off("opponent-disconnected-game");      
      clearMessages();
    };
  }, [gameId, user, myColor, socket]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameOver || !isMyTurn || animatingPiece) return;

    if (selectedPiece) {
      const isValidMove = validMoves.some((m) => m.row === row && m.col === col);
      if (isValidMove) {
        const captured = board[row][col] !== EMPTY_CELL;
        socket.emit("make-move", { 
            gameId, 
            playerId: user?.id, 
            from: selectedPiece, 
            to: { row, col }, 
            captured 
        });
        setSelectedPiece(null);
        setValidMoves([]);
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
        if (board[row][col] === myPiece) {
             setSelectedPiece({ row, col });
             setValidMoves(GameModel.getValidMoves(board, { row, col }, myPiece));
        }
      }
    } else if (board[row][col] === myPiece) {
      setSelectedPiece({ row, col });
      setValidMoves(GameModel.getValidMoves(board, { row, col }, myPiece));
    }
  }, [gameOver, isMyTurn, animatingPiece, selectedPiece, validMoves, board, myPiece, user, gameId, socket]);

  const handleSurrender = useCallback(() => {
    if (!user) return;
    if (window.confirm("Tem certeza que deseja desistir?")) {
      socket.emit("surrender", { gameId, playerId: user.id });
    }
  }, [user, gameId, socket]);

  const exitGame = useCallback(
    () => {
      if (!gameOver) { socket.emit("surrender", { gameId, playerId: user.id }); }
      navigate("lobby")
    }, [navigate]
  );
  
  // Nova Action para Replay
  const viewReplay = useCallback(() => navigate("game-review", gameId), [navigate, gameId]);

  return {
    gameState: {
      board,
      currentPlayer,
      isMyTurn,
      opponentName,
      winner,
      gameOver,
      selectedPiece,
      validMoves,
      animatingPiece,
      lastMove,
      stats: {
        blackCaptures,
        whiteCaptures,
        moveHistory,
        elapsedTime
      },
      user
    },
    actions: {
      handleCellClick,
      handleSurrender,
      exitGame,
      viewReplay
    }
  };
};