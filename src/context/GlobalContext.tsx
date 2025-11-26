import { createContext, useContext, useState, type ReactNode } from "react";


interface GlobalState {
  isPlaying: boolean
  setIsPlaying: (value: boolean) => void
  gameId: string
  setGameId: (gameId: string) => void
}


const GlobalContext = createContext<GlobalState | undefined>(undefined);


export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null)

  return (
    <GlobalContext.Provider value={{ isPlaying, setIsPlaying, gameId, setGameId }}>
      {children}
    </GlobalContext.Provider>
  );
}


export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used inside GlobalProvider");
  return ctx;
}
