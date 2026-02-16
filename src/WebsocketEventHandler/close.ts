import { User } from "../types";

export function handleWebsocketClose(roomId: string, users: User[]) {
    //this.Users = this.Users.filter(user => user.connection !== server);
    //delete user or not? (for reconnect)

    if (users.length === 0) {
        console.log(`[Room ${roomId}] no users left — cleared internal state`);
    }
}
