import { useEffect, useState, useRef, useCallback } from 'react';
import type { PageType } from '../types/general';
import './MatchHistoryPage.css';
import { linesApi } from '../api/linesApi';
import type { GameHistory } from '../types/game';
import { GameHistoryItem } from '../components/GameHistoryItem'; // IMPORT NOVO

interface MatchHistoryPageProps {
  navigate: (page: PageType, data?: any) => void;
}

const LIMIT = 40;

const MatchHistoryPage = ({ navigate }: MatchHistoryPageProps) => {
  const [activeTab, setActiveTab] = useState<"player" | "global">("player");

  const [playerGames, setPlayerGames] = useState<GameHistory[]>([]);
  const [globalGames, setGlobalGames] = useState<GameHistory[]>([]);

  const [playerOffset, setPlayerOffset] = useState(0);
  const [globalOffset, setGlobalOffset] = useState(0);

  const [loading, setLoading] = useState(false);
  const [hasMorePlayer, setHasMorePlayer] = useState(true);
  const [hasMoreGlobal, setHasMoreGlobal] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadPlayerHistory = useCallback(async () => {
    if (!hasMorePlayer) return;
    setLoading(true);
    try {
      const data = await linesApi.game.matchHistory(LIMIT, playerOffset);
      if (data.length < LIMIT) setHasMorePlayer(false);
      setPlayerGames(prev => [...prev, ...data]);
      setPlayerOffset(prev => prev + LIMIT);
    } finally {
      setLoading(false);
    }
  }, [playerOffset, hasMorePlayer]);

  const loadGlobalHistory = useCallback(async () => {
    if (!hasMoreGlobal) return;
    setLoading(true);
    try {
      const data = await linesApi.game.getGlobalGameHistory(LIMIT, globalOffset);
      if (data.length < LIMIT) setHasMoreGlobal(false);
      setGlobalGames(prev => [...prev, ...data]);
      setGlobalOffset(prev => prev + LIMIT);
    } finally {
      setLoading(false);
    }
  }, [globalOffset, hasMoreGlobal]);

  useEffect(() => {
    // Carrega inicial
    if (playerGames.length === 0) loadPlayerHistory();
  }, []);

  useEffect(() => {
    if (activeTab === "global" && globalGames.length === 0) {
      loadGlobalHistory();
    }
  }, [activeTab]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loading) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50; // Aumentei margem para 50px
    if (atBottom) {
      if (activeTab === "player") loadPlayerHistory();
      else loadGlobalHistory();
    }
  };

  // Função helper para renderizar a lista
  const renderGames = (list: GameHistory[], mode: "player" | "global") => (
    <ul className="match-list fade-in">
      {list.length === 0 && !loading && (
          <div className="empty-state">Nenhuma partida encontrada.</div>
      )}
      
      {list.map((g) => (
        <GameHistoryItem
          key={g.gameId}
          game={g}
          onReview={() => navigate("game-review", g.gameId )}
        />
      ))}
    </ul>
  );

  return (
    <div className="app-container">
      <div className="history-card">

        <header className="history-header">
          <h1>Histórico de Partidas</h1>
          <div className="tabs">
            <button
              className={`tab-btn-min ${activeTab === "player" ? "active" : ""}`}
              onClick={() => setActiveTab("player")}
            >
              Minhas Partidas
            </button>

            <button
              className={`tab-btn-min ${activeTab === "global" ? "active" : ""}`}
              onClick={() => setActiveTab("global")}
            >
              Partidas Globais
            </button>
          </div>
        </header>

        {/* Header da Tabela (Opcional, mas ajuda na leitura em Desktop) */}
        <div className="list-header-labels">
            <span>Status</span>
            <span>Jogadores</span>
            <span>Detalhes</span>
            <span>Ação</span>
        </div>

        <main
          className="history-content"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {activeTab === "player" && renderGames(playerGames, "player")}
          {activeTab === "global" && renderGames(globalGames, "global")}

          {loading && <div className="loading-spinner">Carregando mais partidas...</div>}
        </main>

      </div>
    </div>
  );
};

export default MatchHistoryPage;