export function cdf(attempts: number, difficulty: number) {
  const p = 16 ** -difficulty;
  return -Math.expm1(Math.floor(Math.max(0, attempts)) * Math.log1p(-p));
}
export function quantile(probability: number, difficulty: number) {
  return Math.ceil(Math.log1p(-probability) / Math.log1p(-(16 ** -difficulty)));
}
export function distribution(samples: number[], difficulty: number) {
  const expected = 16 ** difficulty;
  const edges = [0, 0.25, 0.5, 1, 2, 3, 4].map((x) => Math.floor(x * expected));
  return edges.map((low, i) => {
    const high = edges[i + 1] ?? Infinity;
    return {
      low,
      high,
      observed: samples.filter((x) => x > low && x <= high).length,
      expected:
        samples.length *
        ((high === Infinity ? 1 : cdf(high, difficulty)) -
          cdf(low, difficulty)),
    };
  });
}
export type Trial = {
  challenge: string;
  nonce: number;
  hash: string;
  attempts: number;
  elapsed: number;
  verified: boolean;
};
export type BatchInput = {
  mode: "batch";
  algorithm: "hashcash" | "sha256d";
  seed: string;
  difficulty: number;
  count: number;
};
export type BatchUpdate = {
  type: "batch-progress" | "batch-done" | "batch-timeout";
  config: BatchInput;
  trials: Trial[];
  elapsed: number;
  totalAttempts: number;
  unfinishedAttempts: number;
};
export function validateBatch(input: BatchInput) {
  if (!["hashcash", "sha256d"].includes(input.algorithm))
    throw Error("概率实验请选择哈希算法");
  if (![1, 2].includes(input.difficulty))
    throw Error("概率实验难度请选择 1 或 2");
  if (![10, 30, 100].includes(input.count))
    throw Error("请选择 10、30 或 100 次实验");
  if (typeof input.seed !== "string" || input.seed.length > 60)
    throw Error("种子最多 60 个字符");
}
