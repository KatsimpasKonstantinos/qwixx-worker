import { websocketReturn, WebsocketRouteHandler } from "../types";
import { getAvatarValidationError, isAvatarValid } from "../validators/avatar";

export const avatar: WebsocketRouteHandler = (server, roomId, users, websocketRequest) => {
    const user = users.find(u => u.connection === server);
    if (!user) {
        console.warn(`[Room ${roomId}] User not found for connection`);
        server.send(websocketReturn("error", "User not found for connection"));
        return;
    }
    const avatarNumber = websocketRequest.message;
    if (!isAvatarValid(avatarNumber)) {
        server.send(websocketReturn("error", getAvatarValidationError(avatarNumber)));
        return;
    }
    user.character.avatar = avatarNumber;
    server.send(websocketReturn("ack", avatarNumber));
}