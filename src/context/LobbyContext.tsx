import { createContext, useContext, useState, type ReactNode } from "react";

export interface MatchData {
  gameId: number;
  yourColor: string;
  opponentRank: number;
  yourRank: number;
}

interface LobbyContextValue {

  numPlayersOnQueue: number;
  setNumPlayersOnQueue: (v: number) => void;

  onQueue: boolean;
  setOnQueue: (v: boolean) => void;

  timeOnQueue: string;
  setTimeOnQueue: (v: string) => void;

  matchData: MatchData | null;
  setMatchData: (v: MatchData | null) => void;
}

const LobbyContext = createContext<LobbyContextValue | undefined>(undefined);

export function LobbyProvider({ children }: { children: ReactNode }) {
  
  const [numPlayersOnQueue, setNumPlayersOnQueue] = useState(0);
  const [onQueue, setOnQueue] = useState(false);
  const [timeOnQueue, setTimeOnQueue] = useState("");
  const [matchData, setMatchData] = useState<MatchData | null>(null);

  const value: LobbyContextValue = {
 
    numPlayersOnQueue,
    setNumPlayersOnQueue,

    onQueue,
    setOnQueue,

    timeOnQueue,
    setTimeOnQueue,

    matchData,
    setMatchData,
  };

  return (
    <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
  );
}

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error("useLobby must be used inside LobbyProvider");
  return ctx;
}
