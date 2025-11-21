// src/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;


export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:3000", {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket"],
    });
  }
  
  return socket;

}
