import type { Socket } from "socket.io-client";


export function setupHeartbeat(socket: Socket) {
  let lastPong = Date.now();
  const HEARTBEAT_INTERVAL = 5000;
  const WATCHDOG_TIMEOUT = 15000;

  const interval = setInterval(() => {
    socket.emit("heartbeat");    
    
    if (Date.now() - lastPong > WATCHDOG_TIMEOUT) {
      console.warn("Heartbeat timeout. Forcing reconnect...");
      socket.disconnect();
      socket.connect();
    }
  }, HEARTBEAT_INTERVAL);

  socket.on("heartbeat-ack", () => {
    lastPong = Date.now();
  });

  return () => clearInterval(interval);
}
