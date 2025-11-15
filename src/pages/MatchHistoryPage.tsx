import React from 'react';
import type { PageType } from '../types/general';
import { Trophy } from 'lucide-react';
import './MatchHistoryPage.css'


const DefeatIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);


interface MatchHistoryPageProps {

    navigate: (page: PageType, data?: any) => void

}


const MatchHistoryPage = ({ navigate }: MatchHistoryPageProps) => {

  return (
    <div className="app-container">      
      <div className="history-card">        
        <header className="history-header">
          <h1>Histórico de Partidas</h1>
          <p>Reveja seus jogos passados</p>
        </header>
        <main className="history-content">
          <ul className="match-list">
            <li className="match-item">
              <div className="match-result-icon victory">
                <Trophy />
              </div>
              <div className="match-info">
                <div className="opponent">vs. Mestre_LOA</div>
                <div className="details">Vitória • 42 jogadas • 12/11/2025</div>
              </div>
              <button className="btn btn-secondary">
                Rever
              </button>
            </li>            
            <li className="match-item">
              <div className="match-result-icon defeat">
                <DefeatIcon />
              </div>
              <div className="match-info">
                <div className="opponent">vs. Ana_Gamer</div>
                <div className="details">Derrota • 30 jogadas • 11/11/2025</div>
              </div>
              <button className="btn btn-secondary">
                Rever
              </button>
            </li>                
            <li className="match-item">
              <div className="match-result-icon victory">
                <Trophy />
              </div>
              <div className="match-info">
                <div className="opponent">vs. Bot (Difícil)</div>
                <div className="details">Vitória • 55 jogadas • 10/11/2025</div>
              </div>
              <button className="btn btn-secondary">
                Rever
              </button>
            </li>
            
            <li className="match-item">
              <div className="match-result-icon defeat">
                <DefeatIcon />
              </div>
              <div className="match-info">
                <div className="opponent">vs. Jogador_Ativo_123</div>
                <div className="details">Derrota • 28 jogadas • 09/11/2025</div>
              </div>
              <button className="btn btn-secondary">
                Rever
              </button>
            </li>
          </ul>
        </main>        
      </div>
    </div>
  );
};

export default MatchHistoryPage;