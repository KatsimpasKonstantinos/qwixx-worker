import { Session, websocketReturnUpdate, } from "./types";
import { DurableObject } from "cloudflare:workers";
import { handleWebsocketError } from "./WebsocketEventHandler/error";
import { handleWebsocketClose } from "./WebsocketEventHandler/close";
import { handleWebsocketMessage } from "./WebsocketEventHandler/message";
import { isUUIDv4Valid } from "./validators/UUIDv4";
import { Clock } from "./clock";
import { createPaper } from "./game/create-papers/create-paper";


export class MyDurableObject extends DurableObject<Env> {
    private session: Session;
    private clock: Clock;

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);
        this.session = {
            status: "waiting",
            round: 0,
            gameState: {
                users: [],
                rules: {
                    maxMisses: 4,
                    missPenalty: 5,
                    crossesNeededToLock: 5,
                    waitTime: 60,
                    paperType: "default",
                    paperModifiers: []
                },
                dices: [
                    { color: "white", value: 1 },
                    { color: "white", value: 1 },
                    { color: "red", value: 1 },
                    { color: "yellow", value: 1 },
                    { color: "green", value: 1 },
                    { color: "blue", value: 1 },
                ]
            }
        }
        this.clock = new Clock(this.session);
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const roomId = parseRoomIdFromPath(url.pathname) ?? "unknown";
        const userId = parseUserIdFromQuery(url);

        if (!isWebSocketUpgrade(request)) {
            return new Response("Expected a WebSocket request", { status: 400 });
        }

        if (!userId) {
            return new Response("Missing or invalid userId query parameter", { status: 400 });
        }

        const [client, server] = Object.values(new WebSocketPair());
        server.accept();
        if (!this.session.gameState.users.find(u => u.id === userId)) this.session.gameState.users.push({ id: userId, character: { name: "Player", avatar: 1 }, playing: false, ready: false, connection: server, myTurn: false, paper: createPaper(this.session.gameState.rules.paperType, this.session.gameState.rules.paperModifiers) });

        server.send(websocketReturnUpdate(this.session));

        server.addEventListener("message", (evt) => {
            handleWebsocketMessage(server, roomId, evt, this.session, userId, this.clock);
        });

        server.addEventListener("close", () => {
            handleWebsocketClose(roomId, this.session);
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

function parseUserIdFromQuery(url: URL) {
    const userId = url.searchParams.get("userId");
    if (!userId || !isUUIDv4Valid(userId)) {
        return null;
    }
    return userId;
}