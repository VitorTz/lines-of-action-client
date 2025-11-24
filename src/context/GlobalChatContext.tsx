import { createContext, useContext, useState, type ReactNode } from "react";

export interface GlobalChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
  avatarUrl: string | null;
}

interface GlobalChatContextValue {
  messages: GlobalChatMessage[];
  addMessage: (msg: GlobalChatMessage) => void;
  clearMessages: () => void;
}

const GlobalChatContext = createContext<GlobalChatContextValue | null>(null);

export function GlobalChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);

  function addMessage(msg: GlobalChatMessage) {
    setMessages((prev) => [...prev, msg]);
  }

  function clearMessages() {
    setMessages([]);
  }

  return (
    <GlobalChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </GlobalChatContext.Provider>
  );
}

export function useGlobalChat() {
  const ctx = useContext(GlobalChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
