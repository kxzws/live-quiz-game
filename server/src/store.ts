import { Game, Player, User } from "./types";

const users = new Map<string, User>(); // users present all the time since user registered
const players = new Map<string, Player>(); // players present only when they joined a game
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
      target.index = user.index ?? target.index;
      target.name = user.name ?? target.name;
      target.password = user.password ?? target.password;
      target.ws = user.ws ?? target.ws;

      return;
    }

    throw new Error("No user with such id");
  },

  findPlayerByField: (fieldName: keyof Player, value: any) => {
    for (const [_, player] of players) {
      if (player[fieldName] === value) {
        return player;
      }
    }
  },
  createPlayer: (id: string, player: Player) => players.set(id, player),
  updatePlayer: (id: string, player: Partial<Player>) => {
    const target = players.get(id);

    if (target) {
      target.index = player.index ?? target.index;
      target.name = player.name ?? target.name;
      target.score = player.score ?? target.score;
      target.ws = player.ws ?? target.ws;

      return;
    }

    throw new Error("No player with such id");
  },
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
      target.id = game.id ?? target.id;
      target.code = game.code ?? target.code;
      target.hostId = game.hostId ?? target.hostId;
      target.questions = game.questions ?? target.questions;
      target.players = game.players ?? target.players;
      target.currentQuestion = game.currentQuestion ?? target.currentQuestion;
      target.status = game.status ?? target.status;
      target.questionStartTime =
        game.questionStartTime ?? target.questionStartTime;
      target.playerAnswers = game.playerAnswers ?? target.playerAnswers;

      return;
    }

    throw new Error("No game with such id");
  },
};
