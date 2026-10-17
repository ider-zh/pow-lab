import { accepts, digest, validate } from "./engine.ts";
import type { Algorithm } from "./engine.ts";

export type SearchInput = {
  algorithm: Algorithm;
  challenge: string;
  difficulty: number;
  N: number;
};
export type Attempt = { nonce: number; hash: string };
export type SearchResult = SearchInput & {
  type: "done" | "timeout" | "limit" | "progress";
  nonce: number;
  hash: string;
  attempts: number;
  elapsed: number;
  trace: Attempt[];
  verified?: boolean;
  verifyMs?: number;
};
export function validateInput(input: SearchInput) {
  validate(input.difficulty, input.N);
  if (!["hashcash", "sha256d", "scrypt"].includes(input.algorithm))
    throw Error("请选择支持的算法");
  if (typeof input.challenge !== "string" || input.challenge.length > 120)
    throw Error("挑战内容最多 120 个字符");
}
export async function search(
  input: SearchInput,
  options: {
    budgetMs?: number;
    maxAttempts?: number;
    onProgress?: (result: SearchResult) => void;
  } = {},
): Promise<SearchResult> {
  validateInput(input);
  const budget = options.budgetMs ?? 15000;
  const maxAttempts = options.maxAttempts ?? 5_000_000;
  const start = performance.now();
  let last = start;
  const trace: Attempt[] = [];
  let current: SearchResult = {
    ...input,
    type: "limit",
    nonce: -1,
    hash: "",
    attempts: 0,
    elapsed: 0,
    trace,
  };
  for (let nonce = 0; nonce < maxAttempts; nonce++) {
    if (performance.now() - start >= budget)
      return {
        ...current,
        type: "timeout",
        elapsed: performance.now() - start,
      };
    const hash = await digest(input.algorithm, input.challenge, nonce, input.N);
    const now = performance.now();
    if (trace.length < 24) trace.push({ nonce, hash });
    current = {
      ...input,
      type: "progress",
      nonce,
      hash,
      attempts: nonce + 1,
      elapsed: now - start,
      trace,
    };
    if (accepts(hash, input.difficulty)) {
      const verifyStart = performance.now();
      const recomputed = await digest(
        input.algorithm,
        input.challenge,
        nonce,
        input.N,
      );
      return {
        ...current,
        type: "done",
        verified: recomputed === hash && accepts(recomputed, input.difficulty),
        verifyMs: performance.now() - verifyStart,
      };
    }
    if (now - last >= 80) {
      options.onProgress?.(current);
      last = now;
    }
  }
  return { ...current, type: "limit" };
}
