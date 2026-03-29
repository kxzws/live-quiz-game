import { WebSocketServer } from "ws";

import { handleReg, handleCreateGame, handleJoinGame } from "./events";

import { EMessageType, WSMessage } from "./types";
import { handleDisconnect } from "./handlers";

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
        throw new Error("Message parsing error");
      }

      switch (type) {
        case EMessageType.REG: {
          handleReg(ws, data);
        }

        case EMessageType.CREATE_GAME: {
          // host sends questions
          handleCreateGame(ws, data);
        }

        case EMessageType.JOIN_GAME: {
          // player joins by code
          handleJoinGame(ws, data);
        }

        default:
          return;
      }
    } catch (error) {
      console.error("Message parsing error:", error);

      ws.send(
        JSON.stringify({
          type: EMessageType.ERROR,
          error: "Invalid message",
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
        error: `Error: ${err}`,
        id: 0,
      }),
    );
  });
});
