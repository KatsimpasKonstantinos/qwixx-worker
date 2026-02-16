import { websocketReturn, WebsocketRouteHandler } from "../types";
import { getNameValidationError, isNameValid } from "../validators/name";

export const name: WebsocketRouteHandler = (server, roomId, users, websocketRequest) => {
    const user = users.find(u => u.connection === server);
    if (!user) {
        console.warn(`[Room ${roomId}] User not found for connection`);
        server.send(websocketReturn("error", "User not found for connection"));
        return;
    }
    const name = websocketRequest.message;
    if (!isNameValid(name)) {
        server.send(websocketReturn("error", getNameValidationError(name)));
        return;
    }
    user.character.name = name;
    server.send(websocketReturn("ack", name));
}