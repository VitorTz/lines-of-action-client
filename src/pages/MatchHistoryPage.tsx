import { useEffect, useState, useRef, useCallback } from 'react';
import type { PageType } from '../types/general';
import './MatchHistoryPage.css';
import { linesApi } from '../api/linesApi';
import type { GameHistory } from '../types/game';
import GameHistoryComponent from '../components/GameHistory';

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
    loadPlayerHistory();
  }, []);

  useEffect(() => {
    if (activeTab === "global" && globalGames.length === 0) {
      loadGlobalHistory();
    }
  }, [activeTab]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loading) return;

    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;

    if (atBottom) {
      if (activeTab === "player") loadPlayerHistory();
      else loadGlobalHistory();
    }
  };

  const renderGames = (list: GameHistory[]) => (
    <ul className="match-list fade-in">
      {list.map((g, idx) => (
        <GameHistoryComponent
          key={idx}
          game={g}
          onReview={() => navigate("game-review", g.gameId)}
        />
      ))}
    </ul>
  );

  return (
    <div className="app-container">
      <div className="history-card">

        <header className="history-header">
          <h1>Histórico de partidas</h1>

          <div className="tabs">
            <button
              className={`tab-btn-min ${activeTab === "player" ? "active" : ""}`}
              onClick={() => setActiveTab("player")}
            >
              Meu Histórico
            </button>

            <button
              className={`tab-btn-min ${activeTab === "global" ? "active" : ""}`}
              onClick={() => setActiveTab("global")}
            >
              Global
            </button>
          </div>
        </header>

        <main
          className="history-content"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {activeTab === "player" && renderGames(playerGames)}
          {activeTab === "global" && renderGames(globalGames)}

          {loading && <p className="loading">Loading...</p>}
        </main>

      </div>
    </div>
  );
};

export default MatchHistoryPage;
