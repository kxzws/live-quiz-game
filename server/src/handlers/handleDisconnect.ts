import { WebSocket } from "ws";

import { db } from "../store";

import { EMessageType } from "../types";

export const handleDisconnect = (ws: WebSocket) => () => {
  const currentDate = new Date();

  console.log(`Client disconnected ${currentDate.toString()}`);

  const targetPlayer = db.findPlayerByField("ws", ws);

  if (targetPlayer) {
    const targetGame = db
      .getAllGames()
      .find(
        (game) =>
          !!game.players.find((player) => player.index === targetPlayer.index),
      );

    if (targetGame) {
      db.updateGame(targetGame.id, {
        players: targetGame.players.filter(
          (player) => player.index !== targetPlayer.index,
        ),
      });

      const updatedPlayersList = targetGame.players.map(
        ({ name, index, score }) => ({
          name,
          index,
          score,
        }),
      );

      targetGame.players.forEach((player) => {
        player.ws?.send(
          JSON.stringify({
            type: EMessageType.UPDATE_PLAYERS,
            data: updatedPlayersList,
            id: 0,
          }),
        );
      });
    }

    db.updateUser(targetPlayer.index, { ws: undefined });

    db.deletePlayer(targetPlayer.index);
  }
};
