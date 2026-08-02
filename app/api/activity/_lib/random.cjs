"use strict";

const crypto = require("node:crypto");

function int(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) throw new Error("maxExclusive must be positive.");
  return crypto.randomInt(maxExclusive);
}

function pick(items) {
  return items[int(items.length)];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = int(index + 1);
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

module.exports = { int, pick, shuffle };
