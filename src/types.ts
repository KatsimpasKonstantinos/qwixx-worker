export interface Env {
  GAME_SESSION: DurableObjectNamespace;
}

export type User = {
  id: string;
  character: Character;
  connection: WebSocket;
}

export type Character = {
  name: string;
  avatar: number;
}

export type WebsocketRouteHandler = (server: WebSocket, roomId: string, users: User[], message: any) => void;