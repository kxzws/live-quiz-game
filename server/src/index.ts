import { WebSocketServer } from "ws";

import {
  handleReg,
  handleCreateGame,
  handleJoinGame,
  handleStartGame,
  handleAnswer,
} from "./events";
import { handleDisconnect } from "./handlers";

import { EMessageType, WSMessage } from "./types";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`\n🚀 WebSocket server started on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  ws.on("message", (rawData) => {
    try {
      const message: WSMessage = JSON.parse(rawData.toString());

      const { type, data } = message;

      if (!type || !data) {
        return ws.send(
          JSON.stringify({
            type: EMessageType.ERROR,
            message: "Message parsing error",
            id: 0,
          }),
        );
      }

      switch (type) {
        case EMessageType.REG: {
          handleReg(ws, data);

          break;
        }

        case EMessageType.CREATE_GAME: {
          // host sends questions
          handleCreateGame(ws, data);

          break;
        }

        case EMessageType.JOIN_GAME: {
          // player joins by code
          handleJoinGame(ws, data);

          break;
        }

        case EMessageType.START_GAME: {
          // host only
          handleStartGame(ws, data);

          break;
        }

        case EMessageType.ANSWER: {
          // player only
          handleAnswer(ws, data);

          break;
        }

        default:
          return;
      }
    } catch (err) {
      console.error("Message parsing error:", err);

      ws.send(
        JSON.stringify({
          type: EMessageType.ERROR,
          message: `Invalid message: ${err}`,
          id: 0,
        }),
      );
    }
  });

  ws.on("close", handleDisconnect(ws));

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);

    ws.send(
      JSON.stringify({
        type: EMessageType.ERROR,
        message: `Error: ${err}`,
        id: 0,
      }),
    );
  });
});
