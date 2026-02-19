import { Session, User } from "../types";

export function handleWebsocketClose(roomId: string, session: Session) {
    //this.Users = this.Users.filter(user => user.connection !== server);
    //delete user or not? (for reconnect)
    console.log(`[Room ${roomId}] websocket connection closed`);

    if (session.gameState.users.length === 0) {
        console.log(`[Room ${roomId}] no users left — cleared internal state`);
    }
}
