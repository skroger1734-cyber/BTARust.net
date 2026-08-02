"use strict";

const crypto = require("node:crypto");
const random = require("./random.cjs");

function createGameState(gameId, config) {
  switch (gameId) {
    case "locked_crate":
      return { winningCrate: random.int(6), crateCount: 6, maxScans: 1, scans: [], signals: [], completed: false };
    case "code_raid":
      return { code: String(random.int(100000)).padStart(5, "0"), maxGuesses: 5, guesses: [], hintHistory: [], completed: false };
    case "monument_quiz": {
      const questions = random.shuffle(config.trivia).slice(0, 5).map((question) => {
        const answerIndexes = random.shuffle(question.answers.map((_, index) => index));
        return {
          question: question.question,
          answers: answerIndexes.map((index) => question.answers[index]),
          correct: answerIndexes.indexOf(question.correct)
        };
      });
      return { questions, step: 0, correct: 0, completed: false };
    }
    case "minefield": {
      const widths = [6, 5, 4, 3];
      const traps = widths.map((width) => random.int(width));
      const readings = traps.map((trap, row) =>
        Array.from({ length: widths[row] }, (_, tile) => {
          const distance = Math.abs(tile - trap);
          if (distance === 0) return 58 + random.int(38);
          if (distance === 1) return 42 + random.int(42);
          return 24 + random.int(52);
        })
      );
      return { row: 0, widths, traps, readings, completed: false };
    }
    case "high_low": {
      const current = random.int(13) + 1;
      const deck = [];
      let previous = current;
      while (deck.length < 8) {
        let next = random.int(13) + 1;
        while (next === previous) next = random.int(13) + 1;
        deck.push(next);
        previous = next;
      }
      return { current, minCard: 1, maxCard: 13, deck, streak: 0, targetStreak: 7, shieldAvailable: false, completed: false };
    }
    case "nuclear_override": {
      const symbols = ["atom", "shield", "bolt", "radiation"];
      return {
        sequence: Array.from({ length: 6 }, () => symbols[random.int(symbols.length)]),
        step: 0,
        phase: "memory",
        completed: false
      };
    }
    default:
      throw new Error(`Unknown game ${gameId}.`);
  }
}

function newSession(userId, gameId, config, date = new Date()) {
  return {
    id: crypto.randomUUID(),
    userId,
    gameId,
    startedAt: date.toISOString(),
    expiresAt: new Date(date.getTime() + config.rules.gameSessionMinutes * 60000).toISOString(),
    outcome: "playing",
    state: createGameState(gameId, config)
  };
}

function playLockedCrate(state, choice) {
  const crateCount = state.crateCount || 5;
  const maxScans = state.maxScans || 2;
  const match = String(choice).match(/^(scan|open)(\d+)$/);
  if (!match) return { error: "Choose a valid scan or crate." };
  const action = match[1];
  const selected = Number(match[2]);
  if (selected < 0 || selected >= crateCount) return { error: "Choose a valid scan or crate." };
  if (action === "scan") {
    if (state.scans.length >= maxScans) return { error: "Your signal sweep is already used. Open a crate." };
    if (state.scans.includes(selected)) return { error: "That crate was already scanned." };
    const distance = Math.abs(selected - state.winningCrate);
    const signal = distance === 0 ? "DIRECT HIT" : distance === 1 ? "HOT" : distance === 2 ? "WARM" : "COLD";
    state.scans.push(selected);
    state.signals.push({ crate: selected, signal });
    return {
      finished: false,
      won: false,
      message: `Crate ${selected + 1} signal: ${signal}. ${maxScans - state.scans.length} sweep(s) remain.`
    };
  }
  if (state.scans.length < maxScans) return { error: "Use your signal sweep before opening a crate." };
  state.completed = true;
  return {
    finished: true,
    won: selected === state.winningCrate,
    message: selected === state.winningCrate
      ? "Signal triangulated. The transmitter is live."
      : `Crate ${selected + 1} was empty. The transmitter was in crate ${state.winningCrate + 1}.`
  };
}

function playCodeRaid(state, guess) {
  const codeLength = state.code.length;
  const maxGuesses = state.maxGuesses || 6;
  if (!new RegExp(`^\\d{${codeLength}}$`).test(guess)) {
    return { error: `Enter exactly ${codeLength} digits, including leading zeroes.` };
  }
  state.guesses.push(guess);
  if (guess === state.code) {
    state.completed = true;
    return { finished: true, won: true, message: `Code ${guess} accepted.` };
  }
  const hints = [...guess].map((digit, index) => {
    if (digit === state.code[index]) return "✅";
    return Number(digit) < Number(state.code[index]) ? "⬆️" : "⬇️";
  });
  state.hintHistory = state.hintHistory || [];
  state.hintHistory.push({
    guess,
    hints: hints.map((hint) => hint === "✅" ? "correct" : hint === "⬆️" ? "up" : "down")
  });
  const hintText = hints.join(" ");
  if (state.guesses.length >= maxGuesses) {
    state.completed = true;
    return { finished: true, won: false, message: `${hintText} — the code was ${state.code}.` };
  }
  return {
    finished: false,
    won: false,
    message: `${hintText} — ${maxGuesses - state.guesses.length} guesses remain.`
  };
}

function playTrivia(state, choice) {
  const question = state.questions[state.step];
  const won = Number(choice) === question.correct;
  if (!won) {
    state.completed = true;
    return { finished: true, won: false, message: `Intel failed. Correct answer: ${question.answers[question.correct]}` };
  }
  state.correct += 1;
  state.step += 1;
  if (state.step === state.questions.length) {
    state.completed = true;
    return { finished: true, won: true, message: `${state.questions.length} monument intel checks confirmed.` };
  }
  return { finished: false, won: false, message: `Correct. Intel ${state.step + 1} of ${state.questions.length} incoming.` };
}

function playMinefield(state, choice) {
  const width = state.widths?.[state.row] || (5 - state.row);
  const selected = Number(choice);
  if (!Number.isInteger(selected) || selected < 0 || selected >= width) return { error: "Invalid tile." };
  if (selected === state.traps[state.row]) {
    state.completed = true;
    return { finished: true, won: false, message: "Boom. You found the trap." };
  }
  state.row += 1;
  if (state.row === state.traps.length) {
    state.completed = true;
    return { finished: true, won: true, message: `You crossed all ${state.traps.length} rows.` };
  }
  return { finished: false, won: false, message: `Safe. Row ${state.row + 1} is ready.` };
}

function playHighLow(state, choice) {
  const targetStreak = state.targetStreak || 7;
  let next = state.deck?.shift() ?? random.int(13) + 1;
  while (next === state.current) next = random.int(13) + 1;
  const wonRound = choice === "higher" ? next > state.current : next < state.current;
  const previous = state.current;
  state.current = next;
  if (!wonRound) {
    if (state.shieldAvailable) {
      state.shieldAvailable = false;
      return { finished: false, won: false, message: `${previous} → ${next}. Scrap shield consumed; your streak survives.` };
    }
    state.completed = true;
    return { finished: true, won: false, message: `${previous} → ${next}. Streak lost.` };
  }
  state.streak += 1;
  if (state.streak === targetStreak) {
    state.completed = true;
    return { finished: true, won: true, message: `${previous} → ${next}. ${targetStreak} calls correct.` };
  }
  return { finished: false, won: false, message: `${previous} → ${next}. ${targetStreak - state.streak} call(s) remain.` };
}

function playNuclearOverride(state, choice) {
  if (state.phase === "memory") {
    if (!["atom", "shield", "bolt", "radiation"].includes(choice)) {
      return { error: "Invalid reactor control." };
    }
    if (choice !== state.sequence[state.step]) {
      state.completed = true;
      return { finished: true, won: false, message: "Override sequence rejected. Reactor containment failed." };
    }
    state.step += 1;
    if (state.step === state.sequence.length) {
      state.phase = "scram";
      return { finished: false, won: false, message: "Sequence accepted. Hold the SCRAM control to shut the reactor down." };
    }
    return { finished: false, won: false, message: `${state.step} of ${state.sequence.length} controls confirmed.` };
  }
  if (state.phase === "scram" && choice === "scram") {
    state.completed = true;
    return { finished: true, won: true, message: "SCRAM complete. The warhead is cold and the site is secure." };
  }
  return { error: "Complete the override sequence before using SCRAM." };
}

function applyMove(session, move, config) {
  if (session.state.completed) return { error: "This game is already finished." };
  switch (session.gameId) {
    case "locked_crate": return playLockedCrate(session.state, move);
    case "code_raid": return playCodeRaid(session.state, move);
    case "monument_quiz": return playTrivia(session.state, move);
    case "minefield": return playMinefield(session.state, move);
    case "high_low": return playHighLow(session.state, move);
    case "nuclear_override": return playNuclearOverride(session.state, move);
    default: return { error: "Unknown game." };
  }
}

module.exports = {
  newSession,
  applyMove,
  playLockedCrate,
  playCodeRaid,
  playTrivia,
  playMinefield,
  playHighLow,
  playNuclearOverride
};
