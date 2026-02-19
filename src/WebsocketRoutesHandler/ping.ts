import { websocketReturnAck, WebsocketRouteHandler } from "../types";

export const ping: WebsocketRouteHandler = (server, roomId, users, websocketRequest) => {
    server.send(websocketReturnAck("ping", new Date().toISOString()));
}
