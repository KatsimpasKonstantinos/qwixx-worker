import type { Env, User, WebsocketRouteHandler } from "./types";
import { DurableObject } from "cloudflare:workers";
import { ping } from "./WebsocketRoutesHandler/ping";
import { name } from "./WebsocketRoutesHandler/name";
import { avatar } from "./WebsocketRoutesHandler/avatar";

const websocketRoutesHandler: Record<string, WebsocketRouteHandler> = {
    "ping": ping,
    "name": name,
    "avatar": avatar,
}

export class MyDurableObject extends DurableObject<Env> {
    private Users: User[];

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);
        this.Users = [];
    }

    private setupConnection(server: WebSocket, roomId: string) {
        server.accept();
        this.Users.push({ id: crypto.randomUUID(), character: { name: "Player", avatar: 1 }, connection: server });

        server.addEventListener("message", (evt) => {
            console.log(`[Room ${roomId}] Received message:`, evt.data);

            if (typeof evt.data !== "string") {
                console.warn(`[Room ${roomId}] Unsupported message type: expected string`);
                server.send(JSON.stringify({ type: "error", message: "Unsupported message type: expected string" }));
                return;
            }

            let message: any;
            try {
                message = JSON.parse(evt.data);
            } catch (e) {
                console.warn(`[Room ${roomId}] Invalid JSON format:`, evt.data);
                server.send(JSON.stringify({ type: "error", message: "Invalid JSON format" }));
                return;
            }

            if (!message.type) {
                console.warn(`[Room ${roomId}] Invalid message format: missing "type" field`);
                server.send(JSON.stringify({ type: "error", message: "Invalid message format: missing 'type' field" }));
                return;
            }

            const handler = websocketRoutesHandler[message.type];

            if (!handler) {
                console.warn(`[Room ${roomId}] No handler for message type:`, message.type);
                server.send(JSON.stringify({ type: "error", message: "No handler for message type" }));
                return;
            }

            handler(server, roomId, this.Users, message);

            console.log(`[Room ${roomId}] Current users:`, this.Users.map(u => ({ id: u.id, name: u.character.name, avatar: u.character.avatar })));

        });

        server.addEventListener("close", () => {
            //this.Users = this.Users.filter(user => user.connection !== server);
            //delete user or not? (for reconnect)

            if (this.Users.length === 0) {
                console.log(`[Room ${roomId}] no users left — cleared internal state`);
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
}

function parseRoomIdFromPath(pathname: string): string | null {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "room" && parts[1]) return parts[1];
    return null;
}

function isWebSocketUpgrade(request: Request): boolean {
    return (request.headers.get("Upgrade") ?? "").toLowerCase() === "websocket";
}