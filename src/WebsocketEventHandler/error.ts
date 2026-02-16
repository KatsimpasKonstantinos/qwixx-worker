export function handleWebsocketError(server: WebSocket, roomId: string, error: any) {
    console.warn(`[Room ${roomId}] websocket error`, error);
}