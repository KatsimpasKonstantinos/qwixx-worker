import { websocketReturnAck, websocketReturnError, WebsocketRouteHandler } from "../types";
import { getAvatarValidationError, isAvatarValid } from "../validators/avatar";

export const avatar: WebsocketRouteHandler = (server, roomId, session, websocketRequest, userId) => {
    const user = session.gameState.users.find(u => u.id === userId);
    if (!user) {
        console.warn(`[Room ${roomId}] User ${websocketRequest.userId} not found for connection`);
        server.send(websocketReturnError("setAvatar", `User ${websocketRequest.userId} not found for connection`));
        return;
    }
    const avatarNumber = websocketRequest.message;
    if (!isAvatarValid(avatarNumber)) {
        server.send(websocketReturnError("setAvatar", getAvatarValidationError(avatarNumber)));
        return;
    }
    user.character.avatar = avatarNumber;
    server.send(websocketReturnAck("setAvatar", avatarNumber));
}