"use strict";

const assert = require("node:assert/strict");
const config = require("../app/api/activity/_lib/giveaways.json");
const {
  newSession,
  playLockedCrate,
  playCodeRaid,
  playTrivia,
  playMinefield,
  playHighLow,
  playNuclearOverride
} = require("../app/api/activity/_lib/games.cjs");

const GAME_IDS = [
  "locked_crate",
  "code_raid",
  "monument_quiz",
  "minefield",
  "high_low",
  "nuclear_override"
];

function verifyRewardConfiguration() {
  assert.deepEqual(Object.keys(config.games).sort(), GAME_IDS.slice().sort());
  assert.equal(new Set(Object.values(config.games).map((game) => game.rewardTable)).size, GAME_IDS.length);

  for (const [tableId, entries] of Object.entries(config.rewardTables)) {
    assert.equal(entries.reduce((sum, entry) => sum + entry.weight, 0), 100, `${tableId} weight`);
    const weights = Object.fromEntries(entries.map((entry) => [entry.reward, entry.weight]));
    assert.equal(new Set(entries.map((entry) => entry.reward)).size, entries.length, `${tableId} duplicate reward`);
    assert.ok(entries.every((entry) => Number.isInteger(entry.weight) && entry.weight > 0));
    assert.ok(entries.every((entry) => config.rewardCatalog[entry.reward]), `${tableId} unknown reward`);
    assert.ok(weights.kit_vip_30 > weights.kit_recruit_30);
    assert.ok(weights.kit_recruit_30 > weights.kit_enlistment_30);
    assert.ok(weights.kit_enlistment_30 > weights.kit_builder_30);
    assert.equal(weights.kit_builder_30, weights.kit_farm_30);
    assert.equal(weights.kit_farm_30, weights.kit_electrical_30);
    assert.ok(weights.kit_electrical_30 > weights.kit_soldier_30);
    assert.ok(weights.kit_soldier_30 > weights.kit_officer_30);
    assert.ok(weights.kit_officer_30 > weights.kit_general_30);
  }

  for (const [rewardId, reward] of Object.entries(config.rewardCatalog)) {
    assert.ok(Number.isInteger(reward.monthlyStock) && reward.monthlyStock > 0, `${rewardId} monthlyStock`);
    assert.ok(["case_keys", "kit", "tebex_code"].includes(reward.type), `${rewardId} type`);
    if (reward.type === "case_keys") assert.ok(Number.isInteger(reward.quantity) && reward.quantity > 0);
    if (reward.type === "kit") {
      assert.match(reward.permission, /^kits\./);
      assert.equal(reward.durationDays, 30);
    }
    if (reward.type === "tebex_code") assert.equal(reward.fulfillment, "code_pool");
  }
}

function verifyProductionGameFlows() {
  let state = { winningCrate: 2, crateCount: 6, maxScans: 1, scans: [], signals: [], completed: false };
  assert.equal(playLockedCrate(state, "scan0").finished, false);
  assert.equal(playLockedCrate(state, "open2").won, true);
  state = { winningCrate: 2, crateCount: 6, maxScans: 1, scans: [], signals: [], completed: false };
  playLockedCrate(state, "scan0");
  assert.equal(playLockedCrate(state, "open0").won, false);

  state = { code: "99999", maxGuesses: 5, guesses: [], hintHistory: [], completed: false };
  assert.equal(playCodeRaid(state, "99999").won, true);
  state = { code: "99999", maxGuesses: 5, guesses: [], hintHistory: [], completed: false };
  for (let index = 0; index < 4; index += 1) assert.equal(playCodeRaid(state, "00000").finished, false);
  assert.equal(playCodeRaid(state, "00000").won, false);

  const questions = config.trivia.slice(0, 5);
  state = { questions, step: 0, correct: 0, completed: false };
  for (let index = 0; index < 4; index += 1) assert.equal(playTrivia(state, questions[index].correct).finished, false);
  assert.equal(playTrivia(state, questions[4].correct).won, true);
  state = { questions, step: 0, correct: 0, completed: false };
  assert.equal(playTrivia(state, (questions[0].correct + 1) % questions[0].answers.length).won, false);

  state = { row: 0, widths: [6, 5, 4, 3], traps: [5, 4, 3, 2], completed: false };
  for (let row = 0; row < 3; row += 1) assert.equal(playMinefield(state, 0).finished, false);
  const minefieldWin = playMinefield(state, 0);
  assert.equal(minefieldWin.won, true);
  assert.match(minefieldWin.message, /4 rows/);
  state = { row: 0, widths: [6, 5, 4, 3], traps: [5, 4, 3, 2], completed: false };
  assert.equal(playMinefield(state, 5).won, false);

  state = { current: 1, minCard: 1, maxCard: 13, deck: [2, 3, 4, 5, 6, 7, 8], streak: 0, targetStreak: 7, shieldAvailable: false, completed: false };
  for (let call = 0; call < 6; call += 1) assert.equal(playHighLow(state, "higher").finished, false);
  assert.equal(playHighLow(state, "higher").won, true);
  state = { current: 13, minCard: 1, maxCard: 13, deck: [12], streak: 0, targetStreak: 7, shieldAvailable: false, completed: false };
  assert.equal(playHighLow(state, "higher").won, false);

  state = { sequence: ["atom", "shield", "bolt", "radiation", "atom", "bolt"], step: 0, phase: "memory", completed: false };
  for (const control of state.sequence) playNuclearOverride(state, control);
  assert.equal(playNuclearOverride(state, "scram").won, true);
  state = { sequence: ["atom"], step: 0, phase: "memory", completed: false };
  assert.equal(playNuclearOverride(state, "shield").won, false);
}

function verifyGeneratedSessions() {
  const started = new Date("2026-07-30T12:00:00.000Z");
  for (const gameId of GAME_IDS) {
    const session = newSession("verification-player", gameId, config, started);
    assert.equal(session.gameId, gameId);
    assert.equal(Date.parse(session.expiresAt) - Date.parse(session.startedAt), 10 * 60 * 1000);
  }
  for (let index = 0; index < 500; index += 1) {
    const state = newSession(`range-${index}`, "high_low", config, started).state;
    const cards = [state.current, ...state.deck];
    assert.equal(state.minCard, 1);
    assert.equal(state.maxCard, 13);
    assert.equal(state.targetStreak, 7);
    assert.ok(cards.every((card) => Number.isInteger(card) && card >= 1 && card <= 13));
    assert.ok(cards.every((card, cardIndex) => cardIndex === 0 || card !== cards[cardIndex - 1]));
  }
}

verifyRewardConfiguration();
verifyProductionGameFlows();
verifyGeneratedSessions();
console.log("Verified 6 production games, 12 win/loss paths, 6 reward tables, and all reward catalog entries.");
