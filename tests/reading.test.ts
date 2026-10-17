import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { stories } from "../src/reading/stories.ts";
import { advancedLessons } from "../src/advanced/catalog.ts";
import { searchSample, doubleSample } from "../src/reading/fixtures.ts";
import {
  graphAnswer,
  isFourCycle,
  primeChain,
  isPrime,
  matrixProduct,
  squareChain,
  epochAt,
  programState,
  pageTurn,
  collisionCards,
} from "../src/reading/illustration-models.ts";

test("every article route has a story and locally scoped illustrations", () => {
  assert.deepEqual(
    Object.keys(stories).sort(),
    [
      "hashcash",
      "sha256d",
      "scrypt",
      ...advancedLessons.map((a) => a.id),
    ].sort(),
  );
  for (const story of Object.values(stories)) {
    assert(story.opening.length > 0);
    assert(story.sections.length >= 3);
    const plates = story.sections.filter((s) => s.illustration);
    assert(plates.length >= 1 && plates.length <= 2);
    assert(plates.every((s) => s.caption));
  }
});
test("fingerprint, search and double-pass samples reproduce independent SHA-256", () => {
  for (const sample of searchSample.attempts) {
    const actual = createHash("sha256")
      .update(`hello-pow:${sample.nonce}`)
      .digest("hex");
    assert.equal(sample.hash, actual);
    assert.equal(sample.hit, actual.startsWith("0"));
  }
  assert.equal(searchSample.attempts.find((s) => s.hit)?.nonce, 18);
  for (const sample of [doubleSample.original, doubleSample.changed]) {
    const raw = createHash("sha256").update(sample.input).digest();
    assert.equal(raw.toString("hex"), sample.first);
    assert.equal(createHash("sha256").update(raw).digest("hex"), sample.second);
  }
});
test("graph illustration accepts a connected cycle and rejects open or repeated edges", () => {
  assert(isFourCycle(graphAnswer));
  assert.equal(isFourCycle([0, 1, 4, 6]), false);
  assert.equal(isFourCycle([0, 0, 4, 5]), false);
  assert.equal(isFourCycle([0, 1, 4]), false);
  assert.equal(isFourCycle([0, 1, 4, 99]), false);
});
test("visible arithmetic examples remain exact", () => {
  assert.deepEqual(primeChain(2), [2, 5, 11, 23, 47, 95]);
  assert.deepEqual(primeChain(3), [3, 7, 15]);
  assert(isPrime(47));
  assert.equal(isPrime(95), false);
  assert.deepEqual(matrixProduct, [10, 14, 13]);
  assert.deepEqual(squareChain(5), [3, 9, 4, 16, 25, 9]);
  assert.deepEqual(programState(4), [
    { a: 2, b: 3 },
    { a: 5, b: 3 },
    { a: 5, b: 6 },
    { a: 30, b: 6 },
    { a: 30, b: 11 },
  ]);
  assert.deepEqual(pageTurn(5), { index: 5, value: 7, next: 3 });
  assert.equal(
    collisionCards.reduce((a, b) => a ^ b, 0),
    0,
  );
});
test("epoch illustration uses the activation boundary as well as the new interval", () => {
  assert.equal(epochAt(11699999, false), 389);
  assert.equal(epochAt(11699999, true), 389);
  assert.equal(epochAt(11700000, false), 390);
  assert.equal(epochAt(11700000, true), 195);
  assert.equal(epochAt(12000000, true), 200);
});
