import { User, websocketReturn } from "./types";
import { DurableObject } from "cloudflare:workers";
import { handleWebsocketError } from "./WebsocketEventHandler/error";
import { handleWebsocketClose } from "./WebsocketEventHandler/close";
import { handleWebsocketMessage } from "./WebsocketEventHandler/message";
import { isValidUUIDv4 } from "./validators/UUIDv4";


export class MyDurableObject extends DurableObject<Env> {
    private Users: User[];

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);
        this.Users = [];
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const roomId = parseRoomIdFromPath(url.pathname) ?? "unknown";
        const userId = parseUserIdFromQuery(url);

        if (!isWebSocketUpgrade(request)) {
            return new Response("Expected a WebSocket request", { status: 400 });
        }

        const [client, server] = Object.values(new WebSocketPair());
        server.accept();
        if (!this.Users.find(u => u.id === userId)) this.Users.push({ id: userId, character: { name: "Player", avatar: 1 }, connection: server });
        server.send(websocketReturn("update", { roomId, userId }));

        server.addEventListener("message", (evt) => {
            handleWebsocketMessage(server, roomId, evt, this.Users);
        });

        server.addEventListener("close", () => {
            handleWebsocketClose(roomId, this.Users);
        });

        server.addEventListener("error", (error) => {
            handleWebsocketError(server, roomId, error);
        });

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

function parseUserIdFromQuery(url: URL): string {
    const userId = url.searchParams.get("userId");
    if (!userId || !isValidUUIDv4(userId)) return crypto.randomUUID();
    return userId;
}