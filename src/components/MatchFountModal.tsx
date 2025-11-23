import type { MatchData } from "../context/LobbyContext"


interface MatchFoundModalProps {
    matchData: MatchData
    timeRemaining: number
    handleAcceptMatch: () => any
    handleDeclineMatch: () => any
}


const MatchFoundModal = ({ matchData, timeRemaining, handleAcceptMatch, handleDeclineMatch }: MatchFoundModalProps ) => {

    return (
        <div className="modal-overlay">
          <div className="match-modal">
            <div className="match-modal-header">
              <h2>Partida Encontrada!</h2>
            </div>

            <div className="match-modal-body">
              <div className="match-info">
                <div className="player-info">
                  <span className="label">Oponente:</span>
                  <span className="rank">Rank {matchData.opponentRank}</span>
                  <span className={`color-badge ${matchData.yourColor}`}>
                    {matchData.yourColor === "black" ? "⚪ Branco" : "⚫ Preto"}
                  </span>
                </div>
              </div>

              {timeRemaining === -1 ? (
                <div className="waiting-opponent">
                  <div className="spinner"></div>
                  <p>Aguardando oponente aceitar...</p>
                </div>
              ) : (
                <>
                  <div className="timer-container">
                    <div
                      className={`timer ${timeRemaining <= 5 ? "timer-warning" : ""}`}
                    >
                      {timeRemaining}s
                    </div>
                    <p className="timer-text">
                      Aceite a partida antes do tempo acabar
                    </p>
                  </div>

                  <div className="match-modal-actions">
                    <button
                      onClick={handleDeclineMatch}
                      className="btn btn-primary"
                    >
                      Recusar
                    </button>
                    <button
                      onClick={handleAcceptMatch}
                      className="btn btn-primary"
                    >
                      Aceitar Partida
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
    )
}


export default MatchFoundModal;