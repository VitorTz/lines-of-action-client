import { useState } from "react";
import { User as UserIcon, Bot } from "lucide-react";
import type { PageType } from "../types/general";
import "./LobbyPage.css";


type ActiveTab = "players" | "bots";


interface PlayersTabProps {
  navigate: (page: PageType, data?: any) => void;
}


// Apenas para mostrar como ficaria
// Os dados virão do websocket
const PlayersTab = ({ navigate }: PlayersTabProps) => (

  <ul className="player-list">
    <li className="player-item">
      <div className="player-info">
        <div className="player-icon">
          <UserIcon />
        </div>
        <div>
          <div className="username">Player 1</div>
          <div className="status">Disponível</div>
        </div>
      </div>
      <button className="btn btn-primary">Desafiar</button>
    </li>
    
    <li className="player-item">
      <div className="player-info">
        <div className="player-icon">
          <UserIcon />
        </div>
        <div>
          <div className="username">Player 2</div>
          <div className="status">Em partida</div>
        </div>
      </div>
      <button className="btn" disabled>
        Ocupado
      </button>
    </li>
    
    <li className="player-item">
      <div className="player-info">
        <div className="player-icon">
          <UserIcon />
        </div>
        <div>
          <div className="username">Player 3</div>
          <div className="status">Disponível</div>
        </div>
      </div>
      <button className="btn btn-primary">Desafiar</button>
    </li>
  </ul>
);

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

interface LobbyPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LobbyPage = ({ navigate }: LobbyPageProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("players");

  return (
    <div className="app-container">
      <div className="lobby-card">
        <header className="lobby-header">
          <h1>Escolha seu oponente</h1>
        </header>

        <nav className="lobby-nav">
          <button
            onClick={() => setActiveTab("players")}
            className={`tab-button ${
              activeTab === "players" ? "tab-active" : ""
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab("bots")}
            className={`tab-button ${activeTab === "bots" ? "tab-active" : ""}`}
          >
            Bots
          </button>
        </nav>

        <main className="lobby-content">
          {activeTab === "players" && <PlayersTab navigate={navigate} />}
          {activeTab === "bots" && <BotsTab navigate={navigate} />}
        </main>

        {activeTab === "players" && (
          <footer className="lobby-footer">
            <button className="btn btn-accent">Novo Jogo</button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
