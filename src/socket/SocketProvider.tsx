import { type ReactNode, useEffect, useMemo } from "react";
import { getSocket } from "./socket";
import { SocketContext } from "./socketContext";
import { setupHeartbeat } from "./socketHeartBeat";
import { useNotification } from "../components/notification/NotificationContext";


interface Props {
  children: ReactNode;
}

export function SocketProvider({ children }: Props) {
    const { addNotification } = useNotification()
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    socket.connect();

    const cleanupHeartbeat = setupHeartbeat(socket);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log("Trying to reconnect...", attempt);
    });

    socket.on("error", (msg) => {
      addNotification({
        title: msg.message,
        type: "error"
      })
    })

    socket.on("searching", () => {
      addNotification({
        title: "Procurando adversário...",
        type: "info",
      })
    })

    return () => {
      cleanupHeartbeat();
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
