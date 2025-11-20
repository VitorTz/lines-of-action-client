import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';


interface Player {
  _id: string;
  socketId: string;
  username: string;
  status: 'online' | 'ready' | 'in-game';
  gameId?: string;
}

interface GameStartedData {
  gameId: string;
  player1: {
    socketId: string;
    username: string;
  };
  player2: {
    socketId: string;
    username: string;
  };
}

interface SocketContextType {
  socket: Socket | null;
  players: Player[];
  currentPlayer: Player | null;
  isConnected: boolean;
  joinLobby: (username: string) => void;
  setReady: (ready: boolean) => void;
  challengePlayer: (targetSocketId: string) => void;
  leaveGame: () => void;
  onGameStarted: (callback: (data: GameStartedData) => void) => void;
  onOpponentDisconnected: (callback: () => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: false
    });

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado do servidor WebSocket');
      setIsConnected(false);
    });

    // Receber lista inicial de jogadores
    newSocket.on('lobby-players', (playerList: Player[]) => {
      setPlayers(playerList);
    });

    // Atualização completa da lista de jogadores
    newSocket.on('lobby-players-update', (playerList: Player[]) => {
      setPlayers(playerList);
    });

    // Novo jogador entrou
    newSocket.on('player-joined', (player: Player) => {
      setPlayers(prev => [...prev, player]);
    });

    // Jogador saiu
    newSocket.on('player-left', (socketId: string) => {
      setPlayers(prev => prev.filter(p => p.socketId !== socketId));
    });

    // Status do jogador mudou
    newSocket.on('player-status-changed', (player: Player) => {
      setPlayers(prev => 
        prev.map(p => p.socketId === player.socketId ? player : p)
      );
      
      // Atualizar jogador atual se for ele
      if (newSocket.id === player.socketId) {
        setCurrentPlayer(player);
      }
    });

    // Erro
    newSocket.on('error', (error: { message: string }) => {
      console.error('Erro do servidor:', error.message);
      alert(error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinLobby = (username: string) => {
    if (socket && !socket.connected) {
      socket.connect();
    }
    
    socket?.emit('join-lobby', { username });
    setCurrentPlayer({
      _id: '',
      socketId: socket?.id || '',
      username,
      status: 'online'
    });
  };

  const setReady = (ready: boolean) => {
    socket?.emit('set-ready', ready);
  };

  const challengePlayer = (targetSocketId: string) => {
    socket?.emit('challenge-player', { targetSocketId });
  };

  const leaveGame = () => {
    socket?.emit('leave-game');
  };

  const onGameStarted = (callback: (data: GameStartedData) => void) => {
    socket?.on('game-started', callback);
    return () => {
      socket?.off('game-started', callback);
    };
  };

  const onOpponentDisconnected = (callback: () => void) => {
    socket?.on('opponent-disconnected', callback);
    return () => {
      socket?.off('opponent-disconnected', callback);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        players,
        currentPlayer,
        isConnected,
        joinLobby,
        setReady,
        challengePlayer,
        leaveGame,
        onGameStarted,
        onOpponentDisconnected
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};