import { useEffect, useState } from 'react';
import type { PageType } from '../types/general';
import './MatchHistoryPage.css';
import { linesApi } from '../api/linesApi';
import type { GameHistory } from '../types/game';
import GameHistoryComponent from '../components/GameHistory';


interface MatchHistoryPageProps {
  navigate: (page: PageType, data?: any) => void;
}


const MatchHistoryPage = ({ navigate }: MatchHistoryPageProps) => {
  const [games, setGames] = useState<GameHistory[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await linesApi.game.matchHistory();
        setGames(result);
      } catch (err) {
        console.log(err);
      }
    };
    init();
  }, []);

  return (
    <div className="app-container">
      <div className="history-card">

        <header className="history-header">
          <h1>Match History</h1>
        </header>

        <main className="history-content">
          <ul className="match-list">
            {games.map((g, idx) => (
              <GameHistoryComponent
                key={idx}
                game={g}
                onReview={() => navigate("game-review", g.gameId)}
              />
            ))}
          </ul>
        </main>

      </div>
    </div>
  );
};

export default MatchHistoryPage;
