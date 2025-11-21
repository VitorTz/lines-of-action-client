
import { useContext } from "react";
import { SocketContext } from "./socketContext";


export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) throw new Error("Socket not available. Wrap components with <SocketProvider>.");
  return socket;
}
