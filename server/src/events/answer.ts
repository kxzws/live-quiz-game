import { WebSocket } from "ws";

import { db } from "../store";

import { EMessageType, AnswerData } from "../types";

export const handleAnswer = (ws: WebSocket, data: AnswerData) => {
  const { gameId, questionIndex, answerIndex } = data;

  const targetGame = db.getGame(gameId);
  const targetPlayer = db.findPlayerByField("ws", ws);

  if (!targetGame || !targetPlayer) {
    return ws.send(
      JSON.stringify({
        type: EMessageType.ERROR,
        message: `No game or player found`,
        id: 0,
      }),
    );
  }

  targetGame.playerAnswers.set(targetPlayer.index, {
    answerIndex,
    timestamp: Date.now(),
  });

  // personal response
  ws.send(
    JSON.stringify({
      type: EMessageType.ANSWER_ACCEPTED,
      data: {
        questionIndex,
      },
      id: 0,
    }),
  );
};
