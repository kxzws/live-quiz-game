import { randomUUID } from "node:crypto";
import { WebSocket } from "ws";

import { db } from "../store";

import { EMessageType, RegData } from "../types";
import { getHash } from "../utils";

export const handleReg = (ws: WebSocket, data: RegData) => {
  const { name, password } = data;

  if (!name || !password) {
    ws.send(
      JSON.stringify({
        type: EMessageType.REG,
        data: {
          name,
          index: "",
          error: true,
          errorText: "Message parsing error",
        },
        id: 0,
      }),
    );
  }

  const targetUser = db.findUserByField("name", name);

  if (targetUser) {
    if (getHash(password) === targetUser.password) {
      db.updateUser(targetUser.index, { ws });

      ws.send(
        JSON.stringify({
          type: EMessageType.REG,
          data: {
            name,
            index: targetUser.index,
            error: false,
            errorText: "",
          },
          id: 0,
        }),
      );
    } else {
      ws.send(
        JSON.stringify({
          type: EMessageType.REG,
          data: {
            name,
            index: "",
            error: true,
            errorText: "Invalid name or password",
          },
          id: 0,
        }),
      );
    }
  } else {
    const userId = randomUUID();

    db.createUser(userId, {
      name,
      password: getHash(password),
      index: userId,
      ws,
    });

    ws.send(
      JSON.stringify({
        type: EMessageType.REG,
        data: {
          name,
          index: userId,
          error: false,
          errorText: "",
        },
        id: 0,
      }),
    );
  }
};
