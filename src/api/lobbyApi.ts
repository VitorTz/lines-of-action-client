import { api } from "./client";
import type { Lobby } from "../types/lobby";


export class LobbyApi {
  
    async createLobby(message?: string): Promise<Lobby> {
        return await api.post<Lobby>("/lobby", { message: message });
    }

    async getValidGames() {
        return await api.get<Lobby[]>("/lobby")
    }

}