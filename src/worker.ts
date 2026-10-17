import { accepts, digest } from "./engine.ts";
import { search, validateInput } from "./search.ts";
import { validateBatch } from "./statistics.ts";
import type { BatchInput, Trial } from "./statistics.ts";
self.onmessage = async ({ data }) => {
  try {
    if (data.mode === "verify") {
      validateInput(data);
      if (!Number.isSafeInteger(data.nonce) || data.nonce < 0)
        throw Error("nonce 请输入非负安全整数");
      const start = performance.now();
      const hash = await digest(
        data.algorithm,
        data.challenge,
        data.nonce,
        data.N,
      );
      self.postMessage({
        type: "verified",
        hash,
        valid: accepts(hash, data.difficulty),
        elapsed: performance.now() - start,
      });
      return;
    }
    if (data.mode === "batch") {
      const config: BatchInput = data;
      validateBatch(config);
      const start = performance.now();
      const trials: Trial[] = [];
      let totalAttempts = 0;
      for (let i = 0; i < config.count; i++) {
        const remainingMs = 30000 - (performance.now() - start);
        const result = await search(
          {
            algorithm: config.algorithm,
            challenge: `${config.seed}:trial:${i}`,
            difficulty: config.difficulty,
            N: 1024,
          },
          {
            budgetMs: Math.max(0, remainingMs),
            maxAttempts: Math.max(0, 1_000_000 - totalAttempts),
          },
        );
        totalAttempts += result.attempts;
        if (result.type !== "done") {
          self.postMessage({
            type: "batch-timeout",
            config,
            trials,
            totalAttempts,
            unfinishedAttempts: result.attempts,
            elapsed: performance.now() - start,
          });
          return;
        }
        trials.push({
          challenge: result.challenge,
          nonce: result.nonce,
          hash: result.hash,
          attempts: result.attempts,
          elapsed: result.elapsed,
          verified: result.verified === true,
        });
        self.postMessage({
          type: "batch-progress",
          config,
          trials,
          totalAttempts,
          unfinishedAttempts: 0,
          elapsed: performance.now() - start,
        });
      }
      self.postMessage({
        type: "batch-done",
        config,
        trials,
        totalAttempts,
        unfinishedAttempts: 0,
        elapsed: performance.now() - start,
      });
      return;
    }
    self.postMessage(
      await search(data, { onProgress: (result) => self.postMessage(result) }),
    );
  } catch (e) {
    self.postMessage({
      type: "error",
      message: e instanceof Error ? e.message : String(e),
    });
  }
};
