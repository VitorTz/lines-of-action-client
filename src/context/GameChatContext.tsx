import { createContext, useContext, useState, type ReactNode } from "react";


export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number;
}


interface ChatContextValue {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}


const GameChatContext = createContext<ChatContextValue | null>(null);


export function GameChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function addMessage(msg: ChatMessage) {
    setMessages(prev => [...prev, msg]);
  }

  function clearMessages() {
    setMessages([]);
  }

  return (
    <GameChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </GameChatContext.Provider>
  );
}

export function useGameChat() {
  const ctx = useContext(GameChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
