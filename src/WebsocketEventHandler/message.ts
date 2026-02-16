import { User, WebsocketRequest, WebsocketRequestType, websocketReturn, WebsocketRouteHandler } from "../types";
import { avatar } from "../WebsocketRoutesHandler/avatar";
import { name } from "../WebsocketRoutesHandler/name";
import { ping } from "../WebsocketRoutesHandler/ping";

const websocketRoutesHandler: Record<WebsocketRequestType, WebsocketRouteHandler> = {
    "ping": ping,
    "setName": name,
    "setAvatar": avatar,
}

export function handleWebsocketMessage(server: WebSocket, roomId: string, evt: MessageEvent, users: User[]) {
    console.log(`[Room ${roomId}] Received message:`, evt.data);

    if (typeof evt.data !== "string") {
        console.warn(`[Room ${roomId}] Unsupported message type: expected string`);
        server.send(websocketReturn("error", "Unsupported message type: expected string"));
        return;
    }

    let websocketRequest: WebsocketRequest;
    try {
        websocketRequest = JSON.parse(evt.data);
    } catch (e) {
        console.warn(`[Room ${roomId}] Invalid JSON format:`, evt.data);
        server.send(websocketReturn("error", "Invalid JSON format"));
        return;
    }

    if (!websocketRequest.type) {
        console.warn(`[Room ${roomId}] Invalid message format: missing "type" field`);
        server.send(websocketReturn("error", "Invalid message format: missing 'type' field"));
        return;
    }

    const handler = websocketRoutesHandler[websocketRequest.type];

    if (!handler) {
        console.warn(`[Room ${roomId}] No handler for message type:`, websocketRequest.type);
        server.send(websocketReturn("error", "No handler for message type"));
        return;
    }

    handler(server, roomId, users, websocketRequest);

    console.log(`[Room ${roomId}] Current users:`, users.map(u => ({ id: u.id, name: u.character.name, avatar: u.character.avatar })));
};