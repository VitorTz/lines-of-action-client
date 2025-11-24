import type { GameHistory } from "../types/game";
import { Trophy, X } from "lucide-react";

interface GameHistoryComponentProps {
  game: GameHistory;
  onReview?: () => void;
}

const GameHistoryComponent = ({
  game,
  onReview,
}: GameHistoryComponentProps) => {
  const isVictory = !!game.winner;

  return (
    <li className="match-item">
      <div className={`match-result-icon ${isVictory ? "victory" : "defeat"}`}>
        {isVictory ? <Trophy /> : <X />}
      </div>

      <div className="match-info">
        <div className="opponent">
          {game.playerBlack.username} vs {game.playerWhite.username}
        </div>

        <div className="details">
          Winner: {game.winner ? game.winner.username : "None"} <br />
          Moves: {game.gameNumMoves} <br />
          Created: {new Date(game.gameCreatedAt).toLocaleString()} <br />
          Updated: {new Date(game.gameUpdatedAt).toLocaleString()}
        </div>
      </div>

      <button className="btn btn-primary" onClick={onReview}>
        Review
      </button>
    </li>
  );
};

export default GameHistoryComponent;
