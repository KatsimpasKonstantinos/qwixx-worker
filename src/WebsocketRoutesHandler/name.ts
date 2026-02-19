import { websocketReturnAck, websocketReturnError, WebsocketRouteHandler } from "../types";
import { getNameValidationError, isNameValid } from "../validators/name";

export const name: WebsocketRouteHandler = (server, roomId, session, websocketRequest, userId) => {
    const user = session.gameState.users.find(u => u.id === userId);
    if (!user) {
        console.warn(`[Room ${roomId}] User ${websocketRequest.userId} not found for connection`);
        server.send(websocketReturnError("setName", `User ${websocketRequest.userId} not found for connection`));
        return;
    }
    const name = websocketRequest.message;
    if (!isNameValid(name)) {
        server.send(websocketReturnError("setName", getNameValidationError(name)));
        return;
    }
    user.character.name = name;
    server.send(websocketReturnAck("setName", name));
}