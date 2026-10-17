import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { search, validateInput } from "../src/search.ts";
import {
  cdf,
  distribution,
  quantile,
  validateBatch,
} from "../src/statistics.ts";
const input = {
  algorithm: "hashcash" as const,
  challenge: "fixed-fixture",
  difficulty: 1,
  N: 1024,
};
test("search finds first qualifying nonce and independently verifies proof", async () => {
  const result = await search(input);
  let expected = 0;
  while (
    !createHash("sha256")
      .update(`fixed-fixture:${expected}`)
      .digest("hex")
      .startsWith("0")
  )
    expected++;
  assert.equal(result.nonce, expected);
  assert.equal(result.attempts, expected + 1);
  assert.equal(result.type, "done");
  assert(result.verified);
  assert.equal(result.trace[0].nonce, 0);
  assert(result.trace.length <= 24);
});
test("budget exhaustion never becomes a proof", async () => {
  const timed = await search(input, { budgetMs: 0 });
  assert.equal(timed.type, "timeout");
  assert.equal(timed.attempts, 0);
  assert.equal(timed.verified, undefined);
  const limited = await search({ ...input, difficulty: 4 }, { maxAttempts: 1 });
  assert.equal(limited.type, "limit");
  assert.equal(limited.attempts, 1);
  assert.equal(limited.verified, undefined);
});
test("geometric probabilities and bins preserve all samples and probability mass", () => {
  assert.equal(cdf(0, 1), 0);
  assert(Math.abs(cdf(1, 1) - 1 / 16) < 1e-12);
  assert(Math.abs(cdf(16, 1) - (1 - (15 / 16) ** 16)) < 1e-12);
  for (const d of [1, 2])
    for (const p of [0.5, 0.95]) {
      const q = quantile(p, d);
      assert(cdf(q, d) >= p);
      assert(cdf(q - 1, d) < p);
    }
  const bins = distribution(
    [1, 4, 5, 8, 9, 16, 17, 32, 33, 48, 49, 64, 65, 500],
    1,
  );
  assert.equal(
    bins.reduce((s, b) => s + b.observed, 0),
    14,
  );
  assert(Math.abs(bins.reduce((s, b) => s + b.expected, 0) - 14) < 1e-10);
});
test("all public code assets match canonical examples", () => {
  for (const id of ["hashcash", "sha256d", "scrypt"])
    for (const ext of ["py", "mjs"])
      assert.equal(
        readFileSync(`examples/${id}.${ext}`, "utf8"),
        readFileSync(`public/examples/${id}.${ext}`, "utf8"),
      );
});
test("worker input validation bounds resource use", () => {
  assert.throws(() =>
    validateInput({ ...input, algorithm: "unknown" as "hashcash" }),
  );
  assert.throws(() => validateInput({ ...input, challenge: "a".repeat(121) }));
  assert.throws(() =>
    validateBatch({
      mode: "batch",
      algorithm: "hashcash",
      seed: "ok",
      difficulty: 3,
      count: 30,
    }),
  );
  assert.throws(() =>
    validateBatch({
      mode: "batch",
      algorithm: "hashcash",
      seed: "ok",
      difficulty: 1,
      count: 1000,
    }),
  );
});
