import { 
  type Piece, 
  BLACK_PIECE, 
  WHITE_PIECE, 
  EMPTY_CELL, 
  type Difficulty
} from "../types/game";
import { GameModel } from "../model/GameModel";
import { formatTime } from "../util/util";
import type { PageType } from "../types/general";
import { useGameBot } from "../hooks/useGameBot";
import "./GameVsBot.css";


const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;


const BOT_NAME: Map<Difficulty, string> = new Map([
  ["easy", "Fácil"],
  ["medium", "Médio"],
  ["hard", "Difícil"]
])

interface GameVsBotProps {
  navigate: (page: PageType, data?: any) => void;
  difficulty?: Difficulty;
}


const GameVsBot = ({ navigate, difficulty = "easy" }: GameVsBotProps) => {
  // (Controller)
  const { gameState, actions, config } = useGameBot(difficulty);
  const { 
    board, currentPlayer, selectedPiece, validMoves, 
    animatingPiece, lastMove, gameOver, winner, isThinking, stats 
  } = gameState;
  
  const isCellValid = (row: number, col: number) => validMoves.some((m) => m.row === row && m.col === col);

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return (lastMove.from.row === row && lastMove.from.col === col) || 
           (lastMove.to.row === row && lastMove.to.col === col);
  };

  const getCellBackgroundColor = (row: number, col: number) => {
    if (isLastMoveSquare(row, col)) return isLightSquare(row, col) ? "#F4C4A2" : "#E8A87C";
    return isLightSquare(row, col) ? "#F0E5DD" : "#8C7A6B";
  };

  const getPieceStyle = (row: number, col: number) => {
    if (animatingPiece && animatingPiece.from.row === row && animatingPiece.from.col === col) {
      const deltaRow = animatingPiece.to.row - animatingPiece.from.row;
      const deltaCol = animatingPiece.to.col - animatingPiece.from.col;
      return { 
        transform: `translate(${deltaCol * 60}px, ${deltaRow * 60}px)`, 
        transition: "transform 0.3s ease-in-out", 
        zIndex: 100 
      };
    }
    return {};
  };

  const shouldShowPiece = (row: number, col: number) => {
    return board[row][col] !== EMPTY_CELL;
  };
  
  const getPieceType = (row: number, col: number): Piece => {
    if (animatingPiece && animatingPiece.from.row === row && animatingPiece.from.col === col) {
      return animatingPiece.piece;
    }
    return board[row][col] as Piece;
  };

  return (
    <div className="container">
      <div className="game-header">
        <div className="stats-row">
          <div className="stat">
            <span className="stat-label">Dificuldade:</span>
            <span className="stat-value uppercase">{BOT_NAME.get(difficulty)!}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Tempo:</span>
            <span className="stat-value">{formatTime(stats.elapsedTime)}</span>
          </div>

          {isThinking && (
             <div className="stat" style={{ color: '#e67e22', fontWeight: 'bold' }}>
                Pensando...
             </div>
          )}

          <div className="stat">
            <span className="stat-label">Jogadas:</span>
            <span className="stat-value">{stats.moveHistory.length}</span>
          </div>
          
          <button className="small-button" style={{ marginLeft: "10px" }} onClick={actions.toggleSound}>
            {config.soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        <div className="turn-indicator">
          <span className="turn-label">Turno:</span>
          <div 
            className="turn-piece" 
            style={{ 
              backgroundColor: currentPlayer === BLACK_PIECE ? "#2B2118" : "#FFF4ED", 
              border: currentPlayer === WHITE_PIECE ? "2px solid #2B2118" : "none" 
            }} 
          />
          <span className="turn-text">
            {currentPlayer === BLACK_PIECE ? "Pretas (Você)" : "Brancas (Bot)"}
          </span>
        </div>
      </div>

      <div className="game-container">
        
        {/* TABULEIRO */}
        <div className="board-wrapper" style={{backgroundColor: 'white'}}>
          <div className="column-labels">
            {GameModel.COLUMNS.map((col, idx) => (
              <div key={idx} className="label">{col}</div>
            ))}
          </div>

          <div className="board-row">
            <div className="row-labels">
              {[8, 7, 6, 5, 4, 3, 2, 1].map((num, idx) => (
                <div key={idx} className="label">{num}</div>
              ))}
            </div>

            <div className="board">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((cell, colIndex) => {
                    const isValid = isCellValid(rowIndex, colIndex);
                    const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
                    
                    return (
                      <div
                        key={colIndex}
                        className="cell"
                        style={{
                          backgroundColor: getCellBackgroundColor(rowIndex, colIndex),
                          cursor: (gameOver || isThinking) ? "default" : (isValid || (cell === BLACK_PIECE && currentPlayer === BLACK_PIECE)) ? "pointer" : "default",
                          border: isSelected ? "3px solid #DC0E0E" : "none",
                        }}
                        onClick={() => actions.onCellClick(rowIndex, colIndex)}
                      >
                        {shouldShowPiece(rowIndex, colIndex) && (
                          <div
                            className="piece"
                            style={{
                              backgroundColor: getPieceType(rowIndex, colIndex) === BLACK_PIECE ? "#2B2118" : "#FFF4ED",
                              border: getPieceType(rowIndex, colIndex) === WHITE_PIECE ? "2px solid #2B2118" : "none",
                              ...getPieceStyle(rowIndex, colIndex),
                            }}
                          />
                        )}
                        {isValid && <div className="valid-move-indicator" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sidebar">
           <div className="stats-container">
            <h3 className="section-title">Estatísticas</h3>
            
            <div className="piece-counts">
              <div className="count-row">
                <span className="count-label">Peças Pretas:</span>
                <span className="count-value">
                  {board.flat().filter((p) => p === BLACK_PIECE).length}
                </span>
              </div>
              <div className="count-row">
                <span className="count-label">Peças Brancas:</span>
                <span className="count-value">
                  {board.flat().filter((p) => p === WHITE_PIECE).length}
                </span>
              </div>
            </div>
          </div>

          <div className="history-container">
            <h3 className="section-title">Histórico de Jogadas</h3>
            <div className="history-list">
              {stats.moveHistory.length === 0 ? (
                <div className="empty-history">Nenhuma jogada ainda</div>
              ) : (
                stats.moveHistory.map((move, idx) => (
                  <div key={idx} className="move-entry">
                    <span className="move-number">{idx + 1}.</span>
                    <span className="move-notation">{move}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="button-container">
            <button className="button" onClick={() => navigate("lobby")}>
              Sair
            </button>
            <button className="button secondary" onClick={actions.resetGame}>
              Reiniciar
            </button>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="modal">
           <div className="modal-content">
            <h2 className="modal-title">Fim de Jogo!</h2>
            <p className="modal-text">
              Vencedor: {winner === BLACK_PIECE ? "Pretas (Você)" : "Brancas (Bot)"}
            </p>
            <div className="final-stats">
              <div className="final-stat">
                <span className="final-stat-label">Tempo total:</span>
                <span className="final-stat-value">{formatTime(stats.elapsedTime)}</span>
              </div>
              <div className="final-stat">
                <span className="final-stat-label">Total de jogadas:</span>
                <span className="final-stat-value">{stats.moveHistory.length}</span>
              </div>
            </div>
            <button className="button" onClick={actions.resetGame}>
              Novo Jogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameVsBot;