import { createSHA256, pbkdf2, sha256 } from "hash-wasm";
export type SearchFrame = { nonce: number; hash: string; hit: boolean };
export type HashcashFilm = {
  kind: "hashcash";
  challenge: string;
  difficulty: number;
  attempts: SearchFrame[];
  verifiedHash: string;
};
export type DoubleSample = { input: string; first: string; second: string };
export type DoubleFilm = {
  kind: "sha256d";
  original: DoubleSample;
  changed: DoubleSample;
  firstFlips: number;
  secondFlips: number;
};
export type MemoryRead = {
  j: number;
  integer: string;
  before: string;
  stored: string;
  xored: string;
  after: string;
};
export type ScryptFilm = {
  kind: "scrypt";
  input: string;
  N: number;
  r: 1;
  initial: string;
  memory: string[];
  reads: MemoryRead[];
  output: string;
};
export type FilmData = HashcashFilm | DoubleFilm | ScryptFilm;
export const bytes = (hex: string) =>
  Uint8Array.from(hex.match(/../g) ?? [], (x) => parseInt(x, 16));
export const hex = (data: Uint8Array) =>
  Array.from(data, (x) => x.toString(16).padStart(2, "0")).join("");
export function bitDifference(a: string, b: string) {
  if (a.length !== b.length)
    throw Error("Bit comparison requires equal lengths");
  const right = bytes(b);
  return bytes(a).reduce((sum, x, i) => {
    let v = x ^ right[i];
    while (v) {
      sum += v & 1;
      v >>>= 1;
    }
    return sum;
  }, 0);
}
export async function hashcashFilm(): Promise<HashcashFilm> {
  const attempts: SearchFrame[] = [];
  for (let nonce = 0; nonce < 256; nonce++) {
    const hash = await sha256(`hello-pow:${nonce}`);
    const hit = hash.startsWith("0");
    attempts.push({ nonce, hash, hit });
    if (hit) break;
  }
  const verifiedHash = await sha256(`hello-pow:${attempts.at(-1)!.nonce}`);
  return {
    kind: "hashcash",
    challenge: "hello-pow",
    difficulty: 1,
    attempts,
    verifiedHash,
  };
}
export async function doubleFilm(): Promise<DoubleFilm> {
  async function sample(input: string) {
    const first = await sha256(input);
    return { input, first, second: await sha256(bytes(first)) };
  }
  const original = await sample("hello-pow:0");
  const changed = await sample("hello-pow:1");
  return {
    kind: "sha256d",
    original,
    changed,
    firstFlips: bitDifference(original.first, changed.first),
    secondFlips: bitDifference(original.second, changed.second),
  };
}
const rotate = (value: number, bits: number) =>
  ((value >>> 0) << bits) | ((value >>> 0) >>> (32 - bits));
// Salsa20/8 expressed as indexed quarter-rounds; RFC 7914 sections 3–5.
export function salsa8(input: Uint32Array) {
  const x = new Uint32Array(input);
  const columns = [
    [0, 4, 8, 12],
    [5, 9, 13, 1],
    [10, 14, 2, 6],
    [15, 3, 7, 11],
  ];
  const rows = [
    [0, 1, 2, 3],
    [5, 6, 7, 4],
    [10, 11, 8, 9],
    [15, 12, 13, 14],
  ];
  for (let round = 0; round < 4; round++)
    for (const group of [columns, rows])
      for (const [a, b, c, d] of group) {
        x[b] ^= rotate(x[a] + x[d], 7);
        x[c] ^= rotate(x[b] + x[a], 9);
        x[d] ^= rotate(x[c] + x[b], 13);
        x[a] ^= rotate(x[d] + x[c], 18);
      }
  return x.map((value, i) => (value + input[i]) >>> 0);
}
const fromBytes = (data: Uint8Array) => {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return Uint32Array.from({ length: data.length / 4 }, (_, i) =>
    view.getUint32(i * 4, true),
  );
};
const toBytes = (data: Uint32Array) => {
  const out = new Uint8Array(data.length * 4);
  const view = new DataView(out.buffer);
  data.forEach((v, i) => view.setUint32(i * 4, v, true));
  return out;
};
export function blockMixR1(input: Uint32Array) {
  if (input.length !== 32) throw Error("Teaching trace uses r=1");
  let x = input.slice(16, 32);
  const output = new Uint32Array(32);
  for (let i = 0; i < 2; i++) {
    x = salsa8(x.map((v, j) => v ^ input[i * 16 + j]));
    output.set(x, i * 16);
  }
  return output;
}
export function romixTrace(initial: Uint8Array, N: number) {
  if (initial.length !== 128 || ![16, 32].includes(N))
    throw Error("Trace supports 128-byte blocks with N=16 or 32");
  let x = fromBytes(initial);
  const memoryWords: Uint32Array[] = [];
  const reads: MemoryRead[] = [];
  for (let i = 0; i < N; i++) {
    memoryWords.push(x.slice());
    x = blockMixR1(x);
  }
  for (let i = 0; i < N; i++) {
    const integer = (BigInt(x[17]) << 32n) | BigInt(x[16]);
    const j = Number(integer % BigInt(N));
    const mixed = x.map((v, k) => v ^ memoryWords[j][k]);
    const after = blockMixR1(mixed);
    reads.push({
      j,
      integer: integer.toString(),
      before: hex(toBytes(x)),
      stored: hex(toBytes(memoryWords[j])),
      xored: hex(toBytes(mixed)),
      after: hex(toBytes(after)),
    });
    x = after;
  }
  return {
    memory: memoryWords.map((v) => hex(toBytes(v))),
    reads,
    mixed: toBytes(x),
  };
}
export async function scryptFilm(N = 16): Promise<ScryptFilm> {
  if (![16, 32].includes(N)) throw Error("Trace N must be 16 or 32");
  const input = "hello-pow:0";
  const derive = (salt: Uint8Array | string, hashLength: number) =>
    pbkdf2({
      password: input,
      salt,
      iterations: 1,
      hashLength,
      hashFunction: createSHA256(),
      outputType: "binary",
    });
  const initial = await derive("pow-lab-v1", 128);
  const trace = romixTrace(initial, N);
  return {
    kind: "scrypt",
    input,
    N,
    r: 1,
    initial: hex(initial),
    memory: trace.memory,
    reads: trace.reads,
    output: hex(await derive(trace.mixed, 32)),
  };
}
