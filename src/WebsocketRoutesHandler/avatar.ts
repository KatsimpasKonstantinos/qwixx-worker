import { WebsocketRouteHandler } from "../types";
import { getAvatarValidationError, isAvatarValid } from "../validators/avatar";

export const avatar: WebsocketRouteHandler = (server, roomId, users, message) => {
    const user = users.find(u => u.connection === server);
    if (!user) {
        console.warn(`[Room ${roomId}] User not found for connection`);
        server.send(JSON.stringify({ type: "error", message: "User not found for connection" }));
        return;
    }
    if (!isAvatarValid(message.avatar)) {
        server.send(JSON.stringify({ type: "error", message: getAvatarValidationError(message.avatar) }));
        return;
    }
    user.character.avatar = message.avatar;
    server.send(JSON.stringify({ type: "ack", avatar: message.avatar }));
}