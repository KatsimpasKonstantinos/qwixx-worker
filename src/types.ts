import { Clock } from "./clock";

export interface Env {
  GAME_SESSION: DurableObjectNamespace;
}

export type User = {
  id: string;
  character: Character;
  paper: Paper;
  playing: boolean;
  ready: boolean;
  connection: WebSocket;
  myTurn: boolean;
}

export type Character = {
  name: string;
  avatar: number;
}

export type WebsocketRouteHandler = (server: WebSocket, roomId: string, session: Session, websocketRequest: WebsocketRequest, userId: string, clock: Clock) => void;

export type GameState = {
  users: User[];
  rules: Rules;
  dices: Dice[];
}

export type Session = {
  status: "waiting" | "playing" | "ended";
  gameState: GameState;
  round: number;
}
export type Color = "red" | "yellow" | "green" | "blue";

export type Dice = {
  color: Color | "white";
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

export type WebsocketReturnType = "ack" | "error" | "update";

function websocketReturn(type: WebsocketReturnType, message: any) {
  return JSON.stringify({ type, message });
}

export function websocketReturnError(type: WebsocketRequestType | "unknown", response: string) {
  return websocketReturn("error", { type, response });
}

export function websocketReturnAck(type: WebsocketRequestType, response: any) {
  return websocketReturn("ack", { type, response });
}

export function websocketReturnUpdate(update: Session) {
  return websocketReturn("update", update);
}

export type WebsocketRequestType = "setName" | "setAvatar" | "ping" | "setReady";

export type WebsocketRequest = {
  type: WebsocketRequestType;
  message: any;
  userId: string;
}