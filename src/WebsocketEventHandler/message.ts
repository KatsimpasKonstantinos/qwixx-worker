import { Clock } from "../clock";
import { Session, User, WebsocketRequest, WebsocketRequestType, websocketReturnError, WebsocketRouteHandler } from "../types";
import { avatar } from "../WebsocketRoutesHandler/avatar";
import { name } from "../WebsocketRoutesHandler/name";
import { ping } from "../WebsocketRoutesHandler/ping";
import { ready } from "../WebsocketRoutesHandler/ready";

const websocketRoutesHandler: Record<WebsocketRequestType, WebsocketRouteHandler> = {
    "ping": ping,
    "setName": name,
    "setAvatar": avatar,
    "setReady": ready
}

export function handleWebsocketMessage(server: WebSocket, roomId: string, evt: MessageEvent, session: Session, userId: string, clock: Clock) {
    console.log(`[Room ${roomId}] Received message:`, evt.data);

    if (typeof evt.data !== "string") {
        console.warn(`[Room ${roomId}] Unsupported message type: expected string`);
        server.send(websocketReturnError("unknown", "Unsupported message type: expected string"));
        return;
    }

    let websocketRequest: WebsocketRequest;
    try {
        websocketRequest = JSON.parse(evt.data);
    } catch (e) {
        console.warn(`[Room ${roomId}] Invalid JSON format:`, evt.data);
        server.send(websocketReturnError("unknown", "Invalid JSON format"));
        return;
    }

    if (!websocketRequest.type) {
        console.warn(`[Room ${roomId}] Invalid message format: missing "type" field`);
        server.send(websocketReturnError("unknown", "Invalid message format: missing 'type' field"));
        return;
    }

    const handler = websocketRoutesHandler[websocketRequest.type];

    if (!handler) {
        console.warn(`[Room ${roomId}] No handler for message type:`, websocketRequest.type);
        server.send(websocketReturnError("unknown", "No handler for message type"));
        return;
    }

    handler(server, roomId, session, websocketRequest, userId, clock);
};