import { WebSocket } from "ws";

import { randomUUID } from "node:crypto";

import { db } from "../store";

import { generateSimpleCode } from "../utils";
import { EMessageType, CreateGameData } from "../types";

export const handleCreateGame = (ws: WebSocket, data: CreateGameData) => {
  const { questions } = data;

  const hostUser = db.findUserByField("ws", ws);

  if (!hostUser) {
    return ws.send(
      JSON.stringify({
        type: EMessageType.ERROR,
        message: `No host user found`,
        id: 0,
      }),
    );
  }

  const gameId = randomUUID();
  const code = generateSimpleCode();

  db.createGame(gameId, {
    id: gameId,
    code,
    hostId: hostUser.index,
    status: "waiting",
    questions,
    currentQuestion: -1,
    players: [],
    playerAnswers: new Map(),
  });

  // personal response to host
  ws.send(
    JSON.stringify({
      type: EMessageType.GAME_CREATED,
      data: {
        gameId,
        code,
      },
      id: 0,
    }),
  );
};
