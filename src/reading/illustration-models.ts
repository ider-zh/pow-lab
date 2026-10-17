// Small, exact operations used by the chapter illustrations. These teach one
// mechanism at a time; full protocol/model execution remains in the Worker labs.
export const graphEdges = [
  [0, 4],
  [0, 6],
  [1, 5],
  [1, 7],
  [2, 4],
  [2, 6],
  [2, 7],
  [3, 5],
  [3, 6],
  [0, 5],
] as const;
export const graphAnswer = [0, 1, 4, 5];
export function isFourCycle(ids: number[]) {
  if (
    ids.length !== 4 ||
    new Set(ids).size !== 4 ||
    ids.some((i) => !Number.isInteger(i) || i < 0 || i >= graphEdges.length)
  )
    return false;
  const adjacency = new Map<number, number[]>();
  for (const id of ids) {
    const [a, b] = graphEdges[id];
    adjacency.set(a, [...(adjacency.get(a) ?? []), b]);
    adjacency.set(b, [...(adjacency.get(b) ?? []), a]);
  }
  if (
    adjacency.size !== 4 ||
    [...adjacency.values()].some((list) => list.length !== 2)
  )
    return false;
  const seen = new Set<number>();
  const pending = [graphEdges[ids[0]][0] as number];
  while (pending.length) {
    const next = pending.pop()!;
    if (seen.has(next)) continue;
    seen.add(next);
    pending.push(...adjacency.get(next)!);
  }
  return seen.size === 4;
}
export function primeChain(start: number, max = 6) {
  const chain = [start];
  while (chain.length < max && isPrime(chain.at(-1)!))
    chain.push(chain.at(-1)! * 2 + 1);
  return chain;
}
export function isPrime(n: number) {
  if (!Number.isSafeInteger(n) || n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
export const matrix = [
  [2, 1, 3],
  [1, 4, 0],
  [3, 2, 1],
];
export const vector = [2, 3, 1];
export const matrixProduct = matrix.map((row) =>
  row.reduce((sum, value, i) => sum + value * vector[i], 0),
);
export function squareChain(steps: number) {
  const chain = [3];
  for (let i = 0; i < steps; i++) chain.push(chain.at(-1)! ** 2 % 77);
  return chain;
}
export function epochAt(block: number, adjusted: boolean) {
  return Math.floor(block / (adjusted && block >= 11700000 ? 60000 : 30000));
}
export const pageValues = Array.from(
  { length: 16 },
  (_, i) => (i * 7 + 3) % 31,
);
export function pageTurn(state: number) {
  const index = state % pageValues.length;
  return {
    index,
    value: pageValues[index],
    next: (state ^ pageValues[index]) + 1,
  };
}
export const instructions = [
  "A ← A + B",
  "B ← B XOR A",
  "A ← A × B",
  "B ← 内存[A mod 4]",
];
export const programMemory = [8, 3, 11, 6];
export function programState(steps: number) {
  let a = 2,
    b = 3;
  const states = [{ a, b }];
  for (let i = 0; i < Math.min(4, steps); i++) {
    if (i === 0) a += b;
    if (i === 1) b ^= a;
    if (i === 2) a *= b;
    if (i === 3) b = programMemory[a % 4];
    states.push({ a, b });
  }
  return states;
}
export const collisionCards = [0b1001, 0b1011, 0b0100, 0b0110];
