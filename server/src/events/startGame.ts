import { WebSocket } from "ws";

import { db } from "../store";

import { EMessageType, StartGameData } from "../types";

// - Correct answer: basePoints * (timeRemaining / timeLimit) —
// faster answers earn more points (maximum 1000 points per question)
// - Wrong answer or no answer: 0 points

const basePoints = 1000;

export const handleStartGame = (ws: WebSocket, data: StartGameData) => {
  const { gameId } = data;

  const targetGame = db.getGame(gameId);

  if (!targetGame) {
    return ws.send(
      JSON.stringify({
        type: EMessageType.ERROR,
        message: `No game found`,
        id: 0,
      }),
    );
  }

  const hostUser = db.getUser(targetGame.hostId);
  const usersToBroadcast = hostUser
    ? [hostUser, ...targetGame.players]
    : targetGame.players;

  let questionIndex = 0;

  db.updateGame(gameId, {
    status: "in_progress",
    currentQuestion: questionIndex,
    questionStartTime: Date.now(),
  });

  // broadcast — first question, options only, no correct answer
  for (const player of usersToBroadcast) {
    player.ws?.send(
      JSON.stringify({
        type: EMessageType.QUESTION,
        data: {
          questionNumber: questionIndex + 1,
          totalQuestions: targetGame.questions.length,
          text: targetGame.questions[questionIndex].text,
          options: targetGame.questions[questionIndex].options,
          timeLimitSec: targetGame.questions[questionIndex].timeLimitSec,
        },
        id: 0,
      }),
    );
  }

  // broadcast after timer expires or all answered
  const handleQuestionsLoop = () => {
    const playerResults = targetGame.players.map((player) => {
      const playerAnswer = targetGame.playerAnswers.get(player.index);

      const isAnswerCorrect =
        !!playerAnswer &&
        targetGame.questions[questionIndex].correctIndex ===
          playerAnswer.answerIndex;

      const pointsEarned =
        isAnswerCorrect && targetGame.questionStartTime
          ? basePoints *
            ((playerAnswer.timestamp - targetGame.questionStartTime) /
              (targetGame.questions[questionIndex].timeLimitSec * 1000))
          : 0;

      db.updatePlayer(player.index, { score: player.score + pointsEarned });

      return {
        name: player.name,
        answered: !!playerAnswer,
        correct: isAnswerCorrect,
        pointsEarned,
        totalScore: player.score + pointsEarned,
      };
    });

    for (const player of usersToBroadcast) {
      player.ws?.send(
        JSON.stringify({
          type: EMessageType.QUESTION_RESULT,
          data: {
            questionIndex,
            correctIndex: targetGame.questions[questionIndex].correctIndex,
            playerResults,
          },
          id: 0,
        }),
      );
    }

    questionIndex += 1;

    if (questionIndex < targetGame.questions.length) {
      db.updateGame(gameId, {
        currentQuestion: questionIndex,
        questionStartTime: Date.now(),
        playerAnswers: new Map(),
      });

      // latency between results and questions
      setTimeout(() => {
        // broadcast — next question
        for (const player of usersToBroadcast) {
          player.ws?.send(
            JSON.stringify({
              type: EMessageType.QUESTION,
              data: {
                questionNumber: questionIndex + 1,
                totalQuestions: targetGame.questions.length,
                text: targetGame.questions[questionIndex].text,
                options: targetGame.questions[questionIndex].options,
                timeLimitSec: targetGame.questions[questionIndex].timeLimitSec,
              },
              id: 0,
            }),
          );
        }
      }, 3000);

      setTimeout(
        handleQuestionsLoop,
        targetGame.questions[questionIndex].timeLimitSec * 1000,
      );

      return;
    }

    const rankedPlayers = [...targetGame.players].sort(
      (a, b) => a.score - b.score,
    );

    const scoreboard = targetGame.players.map((player) => ({
      name: player.name,
      score: player.score,
      rank:
        rankedPlayers.findIndex((ranked) => ranked.index === player.index) + 1,
    }));

    // latency before the game results
    setTimeout(() => {
      for (const player of usersToBroadcast) {
        player.ws?.send(
          JSON.stringify({
            type: EMessageType.GAME_FINISHED,
            data: {
              scoreboard,
            },
            id: 0,
          }),
        );
      }

      db.updateGame(gameId, {
        status: "finished",
        currentQuestion: -1,
        questionStartTime: undefined,
        playerAnswers: new Map(),
      });
    }, 5000);
  };

  setTimeout(
    handleQuestionsLoop,
    targetGame.questions[questionIndex].timeLimitSec * 1000,
  );
};
