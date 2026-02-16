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

export type GameState = {
  papers: Map<User, Paper>;
  rules: Rules;
}

export type Color = "red" | "yellow" | "green" | "blue";

export type Dice = {
  color: Color;
  value: 1 | 2 | 3 | 4 | 5 | 6;
}

export type Cell = {
  number: number;
  color: Color;
  crossed: boolean;
  canLockRow: boolean;
}

export type Row = {
  cells: Cell[];
  color: Color;
  locked: boolean;
  lockTicked: boolean;
}

export type Paper = {
  rows: Row[];
  misses: number;
}

export type Rules = {
  maxMisses: number;
  missPenalty: number;
  crossesNeededToLock: number;
  waitTime: number;
  paperType: PaperType;
  paperModifiers: PaperModifier[];
}

export type PaperType = "default" | "longo";

export type PaperModifier = "mixedColors" | "mixedNumbers";

