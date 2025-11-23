import { EasyBot } from "../bot/EasyBot";
import { MediumBot } from "../bot/MediumBot";
import { HardBot } from "../bot/HardBot";
import { BotPlayer } from "../bot/BotPlayer";
import type { Difficulty, Board, Move } from "../types/game";


let currentBot: BotPlayer | null = null;
let currentDifficulty: Difficulty | null = null;


self.onmessage = (e: MessageEvent) => {
  const { board, allMoves, difficulty } = e.data as {
    board: Board;
    allMoves: Move[];
    difficulty: Difficulty;
  };

  try {
    if (!currentBot || currentDifficulty !== difficulty) {
      switch (difficulty) {
        case "easy":
          currentBot = new EasyBot();
          break;
        case "medium":
          currentBot = new MediumBot();
          break;
        case "hard":
          currentBot = new HardBot();
          break;
        default:
          currentBot = new MediumBot();
      }
      currentDifficulty = difficulty;
    }
    
    const bestMove = currentBot.selectMove(board, allMoves);

    self.postMessage({ type: "SUCCESS", move: bestMove });
  } catch (error) {
    self.postMessage({ type: "ERROR", error });
  }
};