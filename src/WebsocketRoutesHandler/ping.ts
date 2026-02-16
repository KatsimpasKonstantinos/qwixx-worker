import { User, websocketReturn, WebsocketRouteHandler } from "../types";

export const ping: WebsocketRouteHandler = (server, roomId, users, websocketRequest) => {
    server.send(websocketReturn("ack", new Date().toISOString()));
}
