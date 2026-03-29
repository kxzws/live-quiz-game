import { Game, Player, User } from "./types";

const users = new Map<string, User>();

const players = new Map<string, Player>();

const games = new Map<string, Game>();

export const db = {
  getUser: (id: string) => users.get(id),
  findUserByField: (fieldName: keyof User, value: any) => {
    for (const [_, user] of users) {
      if (user[fieldName] === value) {
        return user;
      }
    }
  },
  createUser: (id: string, user: User) => users.set(id, user),
  updateUser: (id: string, user: Partial<User>) => {
    const target = users.get(id);
    if (target) {
      users.set(id, {
        ...target,
        ...user,
      });

      return;
    }

    throw new Error("No user with such id");
  },

  getPlayer: (id: string) => players.get(id),
  findPlayerByField: (fieldName: keyof Player, value: any) => {
    for (const [_, player] of players) {
      if (player[fieldName] === value) {
        return player;
      }
    }
  },
  createPlayer: (id: string, player: Player) => players.set(id, player),
  deletePlayer: (id: string) => players.delete(id),

  getAllGames: () => Array.from(games.values()),
  getGame: (id: string) => games.get(id),
  findGameByField: (fieldName: keyof Game, value: any) => {
    for (const [_, game] of games) {
      if (game[fieldName] === value) {
        return game;
      }
    }
  },
  createGame: (id: string, game: Game) => games.set(id, game),
  updateGame: (id: string, game: Partial<Game>) => {
    const target = games.get(id);
    if (target) {
      games.set(id, {
        ...target,
        ...game,
      });

      return;
    }

    throw new Error("No game with such id");
  },
  deleteGame: (id: string) => games.delete(id),
};
