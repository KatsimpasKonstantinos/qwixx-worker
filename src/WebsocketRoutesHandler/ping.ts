import { User, WebsocketRouteHandler } from "../types";

export const ping: WebsocketRouteHandler = (server: WebSocket, roomId: string, users: User[], message: any) => {
    server.send(JSON.stringify({ type: "ack", timestamp: Date.now() }));
}
