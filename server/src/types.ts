import type { WebSocket } from "ws";

export interface Player {
  name: string;
  index: string; // unique player id
  score: number;
  ws?: WebSocket;
  hasAnswered?: boolean;
  answerTime?: number;
  answeredCorrectly?: boolean;
}

export interface Question {
  text: string;
  options: string[]; // exactly 4 options
  correctIndex: number; // index of the correct option (0-3)
  timeLimitSec: number; // time limit for the question in seconds
}

export interface Game {
  id: string;
  code: string; // 6-character alphanumeric code
  hostId: string;
  questions: Question[];
  players: Player[];
  currentQuestion: number; // index of current question (-1 before start)
  status: "waiting" | "in_progress" | "finished";
  questionStartTime?: number;
  questionTimer?: NodeJS.Timeout;
  playerAnswers: Map<string, { answerIndex: number; timestamp: number }>;
}

export interface User {
  name: string;
  password: string;
  index: string;
  ws?: WebSocket;
}

export enum EMessageType {
  // req
  CREATE_GAME = "create_game",
  JOIN_GAME = "join_game",

  // req/res
  REG = "reg",

  // res
  GAME_CREATED = "game_created",
  GAME_JOINED = "game_joined",
  PLAYER_JOINED = "player_joined",
  UPDATE_PLAYERS = "update_players",

  ERROR = "error",
}

export interface WSMessage {
  // type: string;
  type: EMessageType;
  data: any;
  id: number;
}

export interface RegData {
  name: string;
  password: string;
}

export interface CreateGameData {
  questions: Question[];
}

export interface JoinGameData {
  code: string;
}

export interface StartGameData {
  gameId: string;
}

export interface AnswerData {
  gameId: string;
  questionIndex: number;
  answerIndex: number;
}
