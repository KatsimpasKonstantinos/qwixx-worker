import { WebsocketRouteHandler } from "../types";
import { getNameValidationError, isNameValid } from "../validators/name";

export const name: WebsocketRouteHandler = (server, roomId, users, message) => {
    const user = users.find(u => u.connection === server);
    if (!user) {
        console.warn(`[Room ${roomId}] User not found for connection`);
        server.send(JSON.stringify({ type: "error", message: "User not found for connection" }));
        return;
    }
    if (!isNameValid(message.name)) {
        server.send(JSON.stringify({ type: "error", message: getNameValidationError(message.name) }));
        return;
    }
    user.character.name = message.name;
    server.send(JSON.stringify({ type: "ack", name: message.name }));
}