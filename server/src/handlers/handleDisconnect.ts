import { WebSocket } from "ws";

import { db } from "../store";

import { EMessageType } from "../types";

export const handleDisconnect = (ws: WebSocket) => () => {
  const currentDate = new Date();

  console.log(`Client disconnected ${currentDate.toString()}`);

  const targetPlayer = db.findUserByField("ws", ws);

  if (!targetPlayer) return;

  const targetGame = db
    .getAllGames()
    .find((game) =>
      game.players.map((player) => player.index).includes(targetPlayer.index),
    );

  if (targetGame) {
    const filteredPlayers = targetGame.players.filter(
      (player) => player.index !== targetPlayer.index,
    );

    const hostUser = db.getUser(targetGame.hostId);
    const usersToBroadcast = hostUser
      ? [hostUser, ...filteredPlayers]
      : filteredPlayers;

    db.updateGame(targetGame.id, {
      players: filteredPlayers,
    });

    const data = filteredPlayers.map(({ name, index, score }) => ({
      name,
      index,
      score,
    }));

    for (const user of usersToBroadcast) {
      user.ws?.send(
        JSON.stringify({
          type: EMessageType.UPDATE_PLAYERS,
          data,
          id: 0,
        }),
      );
    }
  }

  db.updateUser(targetPlayer.index, { ws: undefined });

  db.deletePlayer(targetPlayer.index);
};
