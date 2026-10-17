// Bounded teaching constructions. Protocol differences are documented in catalog.ts.
export type Hash = (message: string) => Promise<string>;
export type Output = {
  kind: string;
  proof: Record<string, any>;
  stats: Record<string, number>;
  trace: Record<string, any>[];
};
export const word = (hex: string) => parseInt(hex.slice(0, 8), 16) >>> 0;
export function prime(n: number) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
export function modpow(base: bigint, power: bigint, modulus: bigint) {
  let result = 1n;
  for (
    base %= modulus;
    power > 0n;
    power >>= 1n, base = (base * base) % modulus
  )
    if (power & 1n) result = (result * base) % modulus;
  return result;
}
// BEGIN equihash
export async function equihash(
  challenge: string,
  count: number,
  h: Hash,
): Promise<Output> {
  const values: number[] = [];
  for (let i = 0; i < count; i++)
    values.push(parseInt((await h(`${challenge}:leaf:${i}`)).slice(0, 4), 16));
  const pairs = new Map<number, number[]>();
  let matches = 0;
  const trace: Record<string, any>[] = [];
  for (let i = 0; i < count; i++)
    for (let j = i + 1; j < count; j++) {
      if (values[i] >>> 8 !== values[j] >>> 8) continue;
      matches++;
      const xor = values[i] ^ values[j];
      const previous = pairs.get(xor);
      if (previous && !previous.includes(i) && !previous.includes(j))
        return {
          kind: "equihash",
          proof: {
            indices: [...previous, i, j],
            values: [...previous, i, j].map((k) => values[k]),
            xor: 0,
          },
          stats: { leaves: count, prefixPairs: matches },
          trace: [...trace, { pair: [i, j], xor }],
        };
      if (!previous) pairs.set(xor, [i, j]);
      if (trace.length < 24) trace.push({ pair: [i, j], xor });
    }
  return {
    kind: "equihash",
    proof: { indices: [], values: [], xor: null },
    stats: { leaves: count, prefixPairs: matches },
    trace,
  };
}
// END equihash
// BEGIN cuckoo
export async function cuckoo(
  challenge: string,
  count: number,
  h: Hash,
): Promise<Output> {
  const edges: { id: number; u: number; v: number }[] = [];
  const lookup = new Map<string, number>();
  for (let id = 0; id < count; id++) {
    const hash = await h(`${challenge}:edge:${id}`);
    const u = parseInt(hash.slice(0, 2), 16) % 8,
      v = 8 + (parseInt(hash.slice(2, 4), 16) % 8);
    edges.push({ id, u, v });
    if (!lookup.has(`${u},${v}`)) lookup.set(`${u},${v}`, id);
  }
  let checked = 0;
  for (let a = 0; a < 8; a++)
    for (let b = a + 1; b < 8; b++)
      for (let c = 8; c < 16; c++)
        for (let d = c + 1; d < 16; d++) {
          checked++;
          const ids = [
            [a, c],
            [a, d],
            [b, c],
            [b, d],
          ].map(([u, v]) => lookup.get(`${u},${v}`));
          if (ids.every((x) => x !== undefined))
            return {
              kind: "cuckoo",
              proof: { edgeIds: ids, nodes: [a, b, c, d] },
              stats: { edges: count, rectanglesChecked: checked },
              trace: edges,
            };
        }
  return {
    kind: "cuckoo",
    proof: { edgeIds: [], nodes: [] },
    stats: { edges: count, rectanglesChecked: checked },
    trace: edges,
  };
}
// END cuckoo
// BEGIN randomx
export async function randomx(
  challenge: string,
  count: number,
  h: Hash,
): Promise<Output> {
  const registers = [1, 2, 3, 4];
  const memory: number[] = [];
  for (let i = 0; i < 32; i++)
    memory.push(word(await h(`${challenge}:memory:${i}`)));
  const trace: Record<string, any>[] = [];
  const ops = ["ADD", "XOR", "MUL", "LOAD", "STORE"];
  for (let i = 0; i < count; i++) {
    const code = await h(`${challenge}:program:${i}`),
      op = parseInt(code.slice(0, 2), 16) % 5,
      a = parseInt(code.slice(2, 4), 16) % 4,
      b = parseInt(code.slice(4, 6), 16) % 4,
      imm = parseInt(code.slice(6, 8), 16);
    if (op === 0) registers[a] = (registers[a] + registers[b]) >>> 0;
    if (op === 1) registers[a] = (registers[a] ^ registers[b]) >>> 0;
    if (op === 2) registers[a] = Math.imul(registers[a], registers[b]) >>> 0;
    if (op === 3) registers[a] = memory[(registers[b] + imm) % 32];
    if (op === 4) memory[(registers[b] + imm) % 32] = registers[a];
    trace.push({ step: i, op: ops[op], a, b, imm, registers: [...registers] });
  }
  return {
    kind: "randomx",
    proof: {
      registers,
      memory,
      output: await h(`${registers.join(",")}:${memory.join(",")}`),
    },
    stats: { instructions: count, memoryWords: 32 },
    trace,
  };
}
// END randomx
// BEGIN dataset
export async function dataset(
  challenge: string,
  block: number,
  h: Hash,
  etchash = false,
): Promise<Output> {
  const epochLength = etchash && block >= 11700000 ? 60000 : 30000,
    epoch = Math.floor(block / epochLength);
  const values: number[] = [];
  for (let i = 0; i < 64; i++)
    values.push(word(await h(`epoch:${epoch}:item:${i}`)));
  let mix = word(await h(challenge));
  const trace: Record<string, any>[] = [];
  for (let round = 0; round < 16; round++) {
    const index = mix % 64;
    mix = (Math.imul(mix, 16777619) ^ values[index]) >>> 0;
    trace.push({ round, index, mix });
  }
  return {
    kind: etchash ? "etchash" : "ethash",
    proof: {
      epoch,
      epochLength,
      mix,
      output: await h(`${challenge}:${epoch}:${mix}`),
    },
    stats: { datasetItems: 64, accesses: 16, block },
    trace,
  };
}
// END dataset
// BEGIN primecoin
export async function primecoin(
  challenge: string,
  length: number,
  h: Hash,
): Promise<Output> {
  const start = 2 + (word(await h(challenge)) % 1000);
  let tested = 0;
  for (let origin = start; origin < start + 20000; origin++) {
    tested++;
    const chain: number[] = [];
    let value = origin;
    for (let i = 0; i < length; i++) {
      if (!prime(value)) break;
      chain.push(value);
      value = 2 * value + 1;
    }
    if (chain.length === length)
      return {
        kind: "primecoin",
        proof: { origin, chain, start },
        stats: { candidates: tested, length },
        trace: chain.map((value, index) => ({ index, value })),
      };
  }
  return {
    kind: "primecoin",
    proof: { origin: null, chain: [], start },
    stats: { candidates: tested, length },
    trace: [],
  };
}
// END primecoin
// BEGIN kheavyhash
export async function kheavyhash(
  challenge: string,
  size: number,
  h: Hash,
): Promise<Output> {
  const input = await h(`${challenge}:input`);
  const vector = input
    .slice(0, size)
    .split("")
    .map((x) => parseInt(x, 16));
  const matrix: number[][] = [];
  const product: number[] = [];
  for (let row = 0; row < size; row++) {
    const values: number[] = [];
    for (let column = 0; column < size; column++)
      values.push(
        parseInt((await h(`${challenge}:matrix:${row}:${column}`))[0], 16),
      );
    matrix.push(values);
    product.push(values.reduce((sum, v, i) => sum + v * vector[i], 0) % 16);
  }
  const mixed = product.map((v, i) => v ^ vector[i]);
  return {
    kind: "kheavyhash",
    proof: {
      vector,
      matrix,
      product,
      mixed,
      output: await h(mixed.map((v) => v.toString(16)).join("")),
    },
    stats: { dimension: size, multiplications: size * size },
    trace: matrix.map((row, index) => ({
      row: index,
      values: row,
      product: product[index],
    })),
  };
}
// END kheavyhash
// BEGIN vdf
export async function vdf(
  challenge: string,
  steps: number,
  h: Hash,
): Promise<Output> {
  const modulus = 1022117n;
  let x = BigInt(2 + (word(await h(challenge)) % 1000000));
  while (x % 1009n === 0n || x % 1013n === 0n) x++;
  let y = x;
  const trace: Record<string, any>[] = [];
  for (let i = 0; i < steps; i++) {
    y = (y * y) % modulus;
    if (i < 16 || i === steps - 1)
      trace.push({ step: i + 1, value: y.toString() });
  }
  let l = 257 + (word(await h(`${modulus}:${x}:${y}:${steps}`)) % 1000);
  while (!prime(l)) l++;
  const quotient = (1n << BigInt(steps)) / BigInt(l),
    pi = modpow(x, quotient, modulus);
  return {
    kind: "vdf",
    proof: {
      modulus: modulus.toString(),
      x: x.toString(),
      y: y.toString(),
      l,
      pi: pi.toString(),
      steps,
    },
    stats: { sequentialSquarings: steps },
    trace,
  };
}
// END vdf
