import { Clock } from "../clock";
import { websocketReturnAck, websocketReturnError, websocketReturnUpdate, WebsocketRouteHandler } from "../types";

export const ready: WebsocketRouteHandler = (server, roomId, session, websocketRequest, userId, clock: Clock) => {
    const user = session.gameState.users.find(u => u.id === userId);
    if (!user) {
        console.warn(`[Room ${roomId}] User ${userId} not found for connection`);
        server.send(websocketReturnError("setReady", `User ${userId} not found for connection`));
        return;
    }
    if (websocketRequest.message !== true && websocketRequest.message !== false) {
        server.send(websocketReturnError("setReady", `Invalid ready value: expected true or false`));
        return;
    }
    user.ready = websocketRequest.message;
    server.send(websocketReturnAck("setReady", websocketRequest.message));

    if (session.gameState.users.every(u => u.ready)) {
        clock.start();
    }
}