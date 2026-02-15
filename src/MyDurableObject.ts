import type { Env } from "./types";
import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject<Env> {
    private connections: Set<WebSocket>;

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);
        this.connections = new Set();
    }

    private setupConnection(server: WebSocket, roomId: string) {
        server.accept();
        this.connections.add(server);

        server.addEventListener("message", (evt) => {
            console.log(`[Room ${roomId}] Received message:`, evt.data);
            for (const conn of this.connections) {
                if (conn.readyState === WebSocket.OPEN) conn.send(evt.data);
            }
        });

        server.addEventListener("close", () => {
            this.connections.delete(server);

            if (this.connections.size === 0) {
                console.log(`[Room ${roomId}] no connections left — cleared internal state`);
            }
        });

        server.addEventListener("error", (err) => {
            console.warn(`[Room ${roomId}] websocket error`, err);
        });

    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const roomId = parseRoomIdFromPath(url.pathname) ?? "unknown";

        if (!isWebSocketUpgrade(request)) {
            return new Response("Expected a WebSocket request", { status: 400 });
        }

        const [client, server] = Object.values(new WebSocketPair());
        this.setupConnection(server, roomId);
        return new Response(null, { status: 101, webSocket: client });
    }

    test(){
        console.log("test");
    }

}

function parseRoomIdFromPath(pathname: string): string | null {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "room" && parts[1]) return parts[1];
    return null;
}

function isWebSocketUpgrade(request: Request): boolean {
    return (request.headers.get("Upgrade") ?? "").toLowerCase() === "websocket";
}