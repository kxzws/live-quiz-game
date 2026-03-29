import { WebSocket } from "ws";

import { db } from "../store";

import { EMessageType, JoinGameData, Player } from "../types";

export const handleJoinGame = (ws: WebSocket, data: JoinGameData) => {
  const { code } = data;

  const joinedUser = db.findUserByField("ws", ws);
  const gameByCode = db.findGameByField("code", code);

  if (!joinedUser || !gameByCode) {
    return ws.send(
      JSON.stringify({
        type: EMessageType.ERROR,
        message: `No game or user found`,
        id: 0,
      }),
    );
  }

  const newPlayer: Player = {
    name: joinedUser.name,
    index: joinedUser.index,
    score: 0,
    ws: joinedUser.ws,
  };

  db.createPlayer(joinedUser.index, newPlayer);

  const updatedPlayersList = [...gameByCode.players, newPlayer];
  db.updateGame(gameByCode.id, {
    players: updatedPlayersList,
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

  const hostUser = db.getUser(gameByCode.hostId);
  const playerCount = updatedPlayersList.length;

  // broadcast to all players in the game
  const usersToBroadcast = hostUser
    ? [hostUser, ...updatedPlayersList]
    : updatedPlayersList;

  for (const player of usersToBroadcast) {
    setTimeout(() => {
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
    }, 20);

    setTimeout(() => {
      const data = updatedPlayersList.map(({ name, index, score }) => ({
        name,
        index,
        score,
      }));

      player.ws?.send(
        JSON.stringify({
          type: EMessageType.UPDATE_PLAYERS,
          data,
          id: 0,
        }),
      );
    }, 30);
  }
};
