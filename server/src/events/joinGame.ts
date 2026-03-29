import { WebSocket } from "ws";

import { db } from "../store";

import { EMessageType, JoinGameData } from "../types";

export const handleJoinGame = (ws: WebSocket, data: JoinGameData) => {
  const { code } = data;

  if (!code || code.length !== 6) {
    ws.send(
      JSON.stringify({
        type: "error",
        error: "Invalid code",
        id: 0,
      }),
    );
  }

  const joinedUser = db.findUserByField("ws", ws);
  const gameByCode = db.findGameByField("code", code);

  if (joinedUser && gameByCode) {
    const newPlayer = {
      name: joinedUser.name,
      index: joinedUser.index,
      score: 0,
      ws: joinedUser.ws,
    };

    db.createPlayer(joinedUser.index, newPlayer);

    db.updateGame(gameByCode.id, {
      players: [...gameByCode.players, newPlayer],
    });

    // personal response to joining player
    ws.send(
      JSON.stringify({
        type: EMessageType.GAME_JOINED,
        data: {
          gameId: gameByCode.id,
        },
        id: 0,
      }),
    );

    const playerCount = gameByCode.players.length;

    // broadcast to all players in the game
    gameByCode.players.forEach((player) => {
      player.ws?.send(
        JSON.stringify({
          type: EMessageType.PLAYER_JOINED,
          data: {
            playerName: joinedUser.name,
            playerCount,
          },
          id: 0,
        }),
      );
    });
  } else {
    ws.send(
      JSON.stringify({
        type: EMessageType.ERROR,
        error: `No game or user found`,
        id: 0,
      }),
    );
  }
};
