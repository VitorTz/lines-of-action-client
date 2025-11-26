import { useState, useEffect, useRef, useCallback } from "react";
import {
  type Board,
  type Position,
  type Piece,
  BLACK_PIECE,
  WHITE_PIECE,
  EMPTY_CELL,
  type Difficulty
} from "../types/game";
import { GameModel } from "../model/GameModel";
import { BotService } from "../bot/bot.service";
import { useGameSounds } from "./useGameSounds";
import { generateNewGameBoard } from "../util/util";

const ANIMATION_DELAY_MS = 300;
const INITIAL_BOARD = generateNewGameBoard();


export const useGameBot = (difficulty: Difficulty) => {

  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Piece>(BLACK_PIECE);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Piece | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [animatingPiece, setAnimatingPiece] = useState<{ from: Position; to: Position; piece: Piece } | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  // --- Estatísticas ---
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  const botService = useRef(new BotService());
  const { playMove, playCapture, playWin, playStart, toggleSound, soundEnabled } = useGameSounds();

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver]);

  // --- Inicialização ---
  const startGame = useCallback(() => {
    setBoard(generateNewGameBoard());
    setCurrentPlayer(BLACK_PIECE);
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setMoveHistory([]);
    setValidMoves([]);
    setSelectedPiece(null);
    setLastMove(null);
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    setIsThinking(false);
    playStart();
  }, [playStart]);

  useEffect(() => {
    startGame();
  }, []);

  const executeMove = useCallback((from: Position, to: Position) => {
    const piece = board[from.row][from.col] as Piece;
    const isCapture = board[to.row][to.col] !== EMPTY_CELL;

    setAnimatingPiece({ from, to, piece });
    setSelectedPiece(null);
    setValidMoves([]);

    setTimeout(() => {
      // Som
      if (isCapture)
        playCapture();
      else
        playMove();

      // Atualiza Tabuleiro
      const newBoard = board.map(row => [...row]);
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = EMPTY_CELL;

      setBoard(newBoard);
      setLastMove({ from, to });
      setAnimatingPiece(null);

      const notation = GameModel.playNotation(from, to, isCapture);
      setMoveHistory(prev => [...prev, notation]);

      const winnerCheck = GameModel.checkWinner(newBoard, currentPlayer);
      if (winnerCheck) {
        setWinner(winnerCheck);
        setGameOver(true);
        playWin();
        return;
      }

      const nextPlayer = currentPlayer === BLACK_PIECE ? WHITE_PIECE : BLACK_PIECE;

      const hasValidMoves = GameModel.getAllValidMoves(newBoard, nextPlayer).length > 0;
      if (!hasValidMoves) {
        setWinner(currentPlayer);
        setGameOver(true);
        playWin();
        return;
      }

      setCurrentPlayer(nextPlayer);

    }, ANIMATION_DELAY_MS);
  }, [board, currentPlayer, playCapture, playMove, playWin]);


  const onCellClick = (row: number, col: number) => {
    if (gameOver || currentPlayer !== BLACK_PIECE || animatingPiece || isThinking) return;

    if (selectedPiece) {
      const isValidMove = validMoves.some(m => m.row === row && m.col === col);
      if (isValidMove) {
        executeMove(selectedPiece, { row, col });
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
        if (board[row][col] === BLACK_PIECE) {
          setSelectedPiece({ row, col });
          setValidMoves(GameModel.getValidMoves(board, { row, col }, BLACK_PIECE));
        }
      }
    } else if (board[row][col] === BLACK_PIECE) {
      setSelectedPiece({ row, col });
      setValidMoves(GameModel.getValidMoves(board, { row, col }, BLACK_PIECE));
    }
  };

  useEffect(() => {
    const triggerBot = async () => {
      if (currentPlayer === WHITE_PIECE && !gameOver && !animatingPiece && gameStarted) {

        const allMoves = GameModel.getAllValidMoves(board, WHITE_PIECE);
        if (allMoves.length === 0) {
          setWinner(BLACK_PIECE);
          setGameOver(true);
          playWin();
          return;
        }

        setIsThinking(true);
        try {
          const bestMove = await botService.current.getBestMove(board, allMoves, difficulty);
          setTimeout(() => {
            setIsThinking(false);
            executeMove(bestMove.from, bestMove.to);
          }, 500);
        } catch (err) {
          console.error("Bot failed", err);
          setIsThinking(false);
        }
      }
    };
    triggerBot();
  }, [currentPlayer, gameOver, animatingPiece, gameStarted, board, difficulty, executeMove, playWin]);

  return {
    gameState: {
      board,
      currentPlayer,
      selectedPiece,
      validMoves,
      animatingPiece,
      lastMove,
      gameOver,
      winner,
      isThinking,
      stats: {
        moveHistory,
        elapsedTime
      }
    },
    actions: {
      onCellClick,
      resetGame: startGame,
      toggleSound
    },
    config: {
      soundEnabled
    }
  };
};