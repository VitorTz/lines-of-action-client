import type { Game } from "../types/game";
import React from "react";
import { Trophy } from "lucide-react";
import { X } from "lucide-react";


interface GameHistoryProps {
  game: Game;
  onReview?: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ game, onReview }) => {
  const isVictory = !!game.winner;

  return (
    <li className="match-item">
      <div className={`match-result-icon ${isVictory ? "victory" : "defeat"}`}>
        {isVictory ? <Trophy /> : <X />}
      </div>

      <div className="match-info">
        <div className="opponent">
          {game.playerBlack} vs {game.playerWhite}
        </div>

        <div className="details">
          Status: {game.status} <br />
          Winner: {game.winner ?? "None"} <br />
          Created: {new Date(game.createdAt).toLocaleString()} <br />
          Updated: {new Date(game.updatedAt).toLocaleString()}
        </div>
      </div>

      <button
        className="btn btn-secondary"
        onClick={onReview}
      >
        Review
      </button>
    </li>
  );
};

export default GameHistory;
