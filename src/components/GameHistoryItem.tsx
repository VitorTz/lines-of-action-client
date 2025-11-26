import { type GameHistory } from "../types/game";
import { Calendar, Clock, Move, PlayCircle, Crown } from "lucide-react";
import "./GameHistoryItem.css";

interface GameHistoryItemProps {
  game: GameHistory;
  onReview: () => void;
}

export const GameHistoryItem = ({ game, onReview }: GameHistoryItemProps) => {
  if (!game || !game.playerBlack || !game.playerWhite) return null;

  const blackWon = (game.winner as any)._id === (game.playerBlack as any)._id;
  const whiteWon = (game.winner as any)._id === (game.playerWhite as any)._id;

  const start = new Date(game.gameCreatedAt);
  const end = new Date(game.gameUpdatedAt);
  const durationMs =
    end.getTime() > start.getTime() ? end.getTime() - start.getTime() : 0;

  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  const durationStr = `${minutes}m ${
    parseInt(seconds) < 10 ? "0" : ""
  }${seconds}s`;

  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(start);

  const renderPlayer = (playerUser: any, isWinner: boolean) => (
    <div className={`player-info ${isWinner ? "is-winner" : "is-loser"}`}>
      <div className="avatar-wrapper">
        <div className="avatar-small">
          {playerUser.perfilImageUrl ? (
            <img src={playerUser.perfilImageUrl} alt={playerUser.username} />
          ) : (
            <span>
              {playerUser.username?.substring(0, 2).toUpperCase() || "??"}
            </span>
          )}
        </div>
        {isWinner && (
          <div className="winner-crown">
            <Crown size={12} fill="#fbbf24" stroke="none" />
          </div>
        )}
      </div>

      <div className="player-text">
        <span className="username">
          {playerUser.username || "Desconhecido"}
        </span>
        {isWinner && <span className="winner-label">Vencedor</span>}
      </div>
    </div>
  );

  return (
    <li className={`history-item-card`}>
      {/* Jogadores */}
      <div className="matchup-container">
        {renderPlayer(game.playerBlack, blackWon)}

        <div className="versus-divider">
          <span className="vs-text">VS</span>
        </div>

        {renderPlayer(game.playerWhite, whiteWon)}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-box" title="Data">
          <Calendar size={14} />
          <span>{dateStr}</span>
        </div>
        <div className="stat-box" title="Duração">
          <Clock size={14} />
          <span>{durationStr}</span>
        </div>
        <div className="stat-box" title="Movimentos">
          <Move size={14} />
          <span>{game.gameNumMoves || 0} lances</span>
        </div>
      </div>

      {/* Ação */}
      <div className="action-area">
        <button onClick={onReview} className="btn-review">
          <PlayCircle size={18} />
          <span className="btn-label">Replay</span>
        </button>
      </div>
    </li>
  );
};
