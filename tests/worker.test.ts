import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { createHash } from "node:crypto";
function runWorker(
  input: unknown,
  finished: string[],
  timeout = 10000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./worker-harness.mjs", import.meta.url));
    const timer = setTimeout(() => {
      worker.terminate();
      reject(Error("worker timeout"));
    }, timeout);
    worker.on("message", (data) => {
      if (finished.includes(data.type) || data.type === "error") {
        clearTimeout(timer);
        worker.terminate();
        resolve(data);
      }
    });
    worker.on("error", (e) => {
      clearTimeout(timer);
      worker.terminate();
      reject(e);
    });
    worker.postMessage(input);
  });
}
test("real worker completes reproducible independent batch trials", async () => {
  const input = {
    mode: "batch",
    algorithm: "hashcash",
    seed: "test-seed",
    difficulty: 1,
    count: 10,
  };
  const first = await runWorker(input, ["batch-done", "batch-timeout"]);
  assert.equal(first.type, "batch-done");
  assert.equal(first.trials.length, 10);
  assert.equal(new Set(first.trials.map((t) => t.challenge)).size, 10);
  for (const t of first.trials) {
    assert(t.verified);
    assert.equal(
      createHash("sha256").update(`${t.challenge}:${t.nonce}`).digest("hex"),
      t.hash,
    );
    assert(t.hash.startsWith("0"));
    assert.equal(t.attempts, t.nonce + 1);
  }
  assert.equal(
    first.totalAttempts,
    first.trials.reduce((s, t) => s + t.attempts, 0),
  );
  const repeated = await runWorker(input, ["batch-done", "batch-timeout"]);
  assert.deepEqual(
    first.trials.map((t) => t.attempts),
    repeated.trials.map((t) => t.attempts),
  );
});
test("verification worker checks nonce and modified challenge", async () => {
  const base = {
    algorithm: "sha256d",
    challenge: "hello-pow",
    difficulty: 1,
    N: 1024,
  };
  const proof = await runWorker(base, ["done"]);
  assert(proof.verified);
  const verified = await runWorker(
    { ...base, mode: "verify", nonce: proof.nonce },
    ["verified"],
  );
  assert(verified.valid);
  assert.equal(verified.hash, proof.hash);
  const changed = await runWorker(
    { ...base, mode: "verify", challenge: "changed", nonce: proof.nonce },
    ["verified"],
  );
  assert.notEqual(changed.hash, proof.hash);
  const invalid = await runWorker({ ...base, mode: "verify", nonce: -1 }, [
    "verified",
  ]);
  assert.equal(invalid.type, "error");
});

test("film data is prepared through the production worker transport", async () => {
  for (const algorithm of ["hashcash", "sha256d", "scrypt"]) {
    const result = await runWorker({ mode: "film", algorithm, N: 16 }, [
      "film",
    ]);
    assert.equal(result.type, "film");
    assert.equal(result.film.kind, algorithm);
  }
});

test("remaining algorithms execute and validate through the production worker", async () => {
  for (const [algorithm, parameter] of Object.entries({
    argon2: 64,
    equihash: 256,
    cuckoo: 64,
    ethash: 11700000,
    etchash: 11700000,
    randomx: 16,
    primecoin: 4,
    kheavyhash: 4,
    vdf: 256,
  })) {
    const result = await runWorker(
      { mode: "advanced", algorithm, parameter, challenge: "hello-pow" },
      ["model-done"],
    );
    assert.equal(result.type, "model-done", algorithm);
    assert(result.verified, algorithm);
    assert(result.solveMs >= 0);
    assert(result.verifyMs >= 0);
    const verification = await runWorker(
      {
        mode: "advanced-verify",
        algorithm,
        parameter,
        challenge: "hello-pow",
        output: result.output,
      },
      ["model-verified"],
    );
    assert(verification.verified, algorithm);
  }
});
