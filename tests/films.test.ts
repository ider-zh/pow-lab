import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, scryptSync } from "node:crypto";
import {
  bitDifference,
  bytes,
  hashcashFilm,
  doubleFilm,
  scryptFilm,
} from "../src/films/data.ts";
test("Hashcash film contains the complete ordered search and its first proof", async () => {
  const film = await hashcashFilm();
  assert.equal(film.attempts.length, 19);
  assert.equal(film.verifiedHash, film.attempts.at(-1)?.hash);
  assert.equal(film.attempts.at(-1)?.nonce, 18);
  for (const [i, frame] of film.attempts.entries()) {
    assert.equal(frame.nonce, i);
    assert.equal(
      frame.hash,
      createHash("sha256").update(`${film.challenge}:${i}`).digest("hex"),
    );
    assert.equal(frame.hit, i === 18);
  }
});
test("double-hash film passes raw bytes and reports actual bit differences", async () => {
  const film = await doubleFilm();
  for (const sample of [film.original, film.changed]) {
    const first = createHash("sha256").update(sample.input).digest();
    assert.equal(sample.first, first.toString("hex"));
    assert.equal(
      sample.second,
      createHash("sha256").update(first).digest("hex"),
    );
    assert.notEqual(
      sample.second,
      createHash("sha256").update(sample.first).digest("hex"),
    );
  }
  const count = (a: string, b: string) =>
    [...Buffer.from(a, "hex")].reduce(
      (n, v, i) =>
        n +
        (v ^ Buffer.from(b, "hex")[i]).toString(2).replaceAll("0", "").length,
      0,
    );
  assert.equal(film.firstFlips, count(film.original.first, film.changed.first));
  assert.equal(
    film.secondFlips,
    count(film.original.second, film.changed.second),
  );
  assert.equal(bitDifference("00", "ff"), 8);
  assert.equal(bitDifference("ff", "ff"), 0);
});
for (const N of [16, 32])
  test(`Scrypt film N=${N} agrees with independent Node implementation and preserves each memory read`, async () => {
    const film = await scryptFilm(N);
    assert.equal(
      film.output,
      scryptSync(film.input, "pow-lab-v1", 32, { N, r: 1, p: 1 }).toString(
        "hex",
      ),
    );
    assert.equal(film.memory.length, N);
    assert.equal(film.reads.length, N);
    assert.equal(film.memory[0], film.initial);
    for (const [i, read] of film.reads.entries()) {
      assert.equal(read.j, Number(BigInt(read.integer) % BigInt(N)));
      assert.equal(
        read.integer,
        Buffer.from(read.before, "hex").readBigUInt64LE(64).toString(),
      );
      assert.equal(read.stored, film.memory[read.j]);
      const xor = Buffer.from(read.before, "hex")
        .map((v, k) => v ^ bytes(read.stored)[k])
        .toString("hex");
      assert.equal(read.xored, xor);
      if (i > 0) assert.equal(read.before, film.reads[i - 1].after);
    }
  });
test("animation memory trace bounds stay small", async () => {
  await assert.rejects(() => scryptFilm(1024));
});
