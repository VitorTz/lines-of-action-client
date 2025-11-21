import { Bot } from "lucide-react";
import { type PageType } from "../types/general";


interface BotsTabProps {
  navigate: (page: PageType, data?: any) => void;
}

const BotsTab = ({ navigate }: BotsTabProps) => (
  <ul className="player-list">
    {/* Bot 1 (Fácil) */}
    <li className="player-item">
      <div className="player-info">
        <div className="player-icon">
          <Bot />
        </div>
        <div>
          <div className="username">Bot (Fácil)</div>
          <div className="status">Faz jogadas aleatórias</div>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => navigate("game-bot", "easy")}
      >
        Jogar
      </button>
    </li>

    {/* Bot 2 (Médio) */}
    <li className="player-item">
      <div className="player-info">
        <div className="player-icon">
          <Bot />
        </div>
        <div>
          <div className="username">Bot (Médio)</div>
          <div className="status">Prioriza capturas e conexões</div>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => navigate("game-bot", "medium")}
      >
        Jogar
      </button>
    </li>

    {/* Bot 3 (Difícil) */}
    <li className="player-item">
      <div className="player-info">
        <div className="player-icon">
          <Bot />
        </div>
        <div>
          <div className="username">Bot (Difícil)</div>
          <div className="status">Minimax</div>
        </div>
      </div>
      <button
        className="btn btn-primary"
        onClick={() => navigate("game-bot", "hard")}
      >
        Jogar
      </button>
    </li>
  </ul>
);


export default BotsTab;