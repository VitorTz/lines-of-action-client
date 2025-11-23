import type { Board, Move, Difficulty } from "../types/game";
import BotWorker from "./bot.worker?worker";


export class BotService {

    private worker: Worker;

    constructor() {
        try {
            this.worker = new BotWorker();
            this.worker.onerror = (e) => {
                console.error("CRITICAL: Erro ao carregar o arquivo do Worker", e);
            };
        } catch (e) {
            console.error("Falha ao inicializar Worker", e);
            throw e;
        }
    }

    public async getBestMove(
        board: Board,
        allMoves: Move[],
        difficulty: Difficulty
    ): Promise<Move> {
        return new Promise((resolve, reject) => {

            // Timeout de 10 segundos (segurança contra travamento)
            const timeoutId = setTimeout(() => {
                cleanup();
                console.warn("Bot demorou demais. Retornando movimento de segurança.");
                if (allMoves.length > 0) {
                    resolve(allMoves[Math.floor(Math.random() * allMoves.length)]);
                } else {
                    reject(new Error("Timeout e sem movimentos"));
                }
            }, 10000);

            const cleanup = () => {
                clearTimeout(timeoutId);
                this.worker.removeEventListener("message", handleMessage);
                this.worker.removeEventListener("error", handleError);
            };

            const handleMessage = (e: MessageEvent) => {
                cleanup();
                const { type, move, error } = e.data;
                if (type === "SUCCESS") {
                    resolve(move);
                } else {
                    console.error("Worker retornou erro:", error);
                    reject(error);
                }
            };

            const handleError = (error: ErrorEvent) => {
                cleanup();
                console.error("Worker crashou:", error);
                reject(error);
            };

            this.worker.addEventListener("message", handleMessage);
            this.worker.addEventListener("error", handleError);

            this.worker.postMessage({ board, allMoves, difficulty });
        });
    }

    public terminate() {
        this.worker.terminate();
    }
}