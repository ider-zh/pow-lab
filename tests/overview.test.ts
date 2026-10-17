import { test } from "node:test";
import assert from "node:assert/strict";
import {
  OVERVIEW_DURATION,
  overviewState,
  overviewChapters,
} from "../src/films/overview.ts";
test("all overviews show successful completion within the fixed ten-second narrative", () => {
  assert.equal(OVERVIEW_DURATION, 10);
  for (const algorithm of ["hashcash", "sha256d", "scrypt"] as const) {
    assert.equal(overviewState(algorithm, 0).phase, 0);
    assert.equal(overviewState(algorithm, 0.2).phase, 1);
    assert.equal(overviewState(algorithm, 0.6).phase, 2);
    assert.equal(overviewState(algorithm, 0.8).phase, 3);
    assert.equal(overviewState(algorithm, 0.88).complete, true);
    assert.equal(overviewState(algorithm, 1).phase, 4);
    assert.equal(overviewState(algorithm, 1).verification, 1);
    assert.equal(overviewState(algorithm, -1).work, 0);
    assert.equal(overviewState(algorithm, 2).phase, 4);
  }
});
test("overview reveals a proof before verification and retains a final comprehension beat", () => {
  for (const algorithm of ["hashcash", "sha256d", "scrypt"] as const) {
    const chapters = overviewChapters[algorithm];
    assert(chapters[2].at < chapters[3].at);
    assert(OVERVIEW_DURATION * (1 - chapters[4].at) >= 1);
    assert.equal(overviewState(algorithm, chapters[2].at).work, 1);
    assert.equal(overviewState(algorithm, chapters[2].at).verification, 0);
  }
});
