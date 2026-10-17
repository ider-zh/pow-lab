import { sha256, argon2id } from "hash-wasm";
import {
  equihash,
  cuckoo,
  randomx,
  dataset,
  primecoin,
  kheavyhash,
  vdf,
  word,
  prime,
  modpow,
} from "./kernels.ts";
import type { Output } from "./kernels.ts";
import { modelOptions } from "./config.ts";
import type { AdvancedId } from "./config.ts";
export const hash = (s: string) => sha256(s);
export async function argon(challenge: string, memory: number) {
  return argon2id({
    password: challenge,
    salt: "pow-lab-argon2-v1",
    iterations: 2,
    parallelism: 1,
    memorySize: memory,
    hashLength: 32,
    outputType: "hex",
  });
}
export function validateModel(
  id: AdvancedId,
  challenge: string,
  parameter: number,
) {
  if (!(id in modelOptions) || !modelOptions[id].includes(parameter as never))
    throw Error("请选择支持的教学参数");
  if (typeof challenge !== "string" || challenge.length > 80)
    throw Error("挑战最多 80 个字符");
}
export async function runModel(
  id: AdvancedId,
  challenge: string,
  parameter: number,
): Promise<Output> {
  validateModel(id, challenge, parameter);
  switch (id) {
    case "argon2":
      return {
        kind: "argon2",
        proof: {
          output: await argon(challenge, parameter),
          memoryKiB: parameter,
          iterations: 2,
          parallelism: 1,
        },
        stats: { parameterMemoryKiB: parameter, passes: 2 },
        trace: [],
      };
    case "equihash":
      return equihash(challenge, parameter, hash);
    case "cuckoo":
      return cuckoo(challenge, parameter, hash);
    case "randomx":
      return randomx(challenge, parameter, hash);
    case "ethash":
    case "etchash":
      return dataset(challenge, parameter, hash, id === "etchash");
    case "primecoin":
      return primecoin(challenge, parameter, hash);
    case "kheavyhash":
      return kheavyhash(challenge, parameter, hash);
    case "vdf":
      return vdf(challenge, parameter, hash);
  }
}
export async function verifyModel(
  id: AdvancedId,
  challenge: string,
  parameter: number,
  result: Output,
) {
  validateModel(id, challenge, parameter);
  if (
    !result ||
    result.kind !== id ||
    !result.proof ||
    typeof result.proof !== "object"
  )
    return false;
  const p = result.proof;
  if (id === "equihash") {
    const ids = p.indices as number[];
    if (
      !Array.isArray(ids) ||
      ids.length !== 4 ||
      new Set(ids).size !== 4 ||
      ids.some((i) => !Number.isInteger(i) || i < 0 || i >= parameter)
    )
      return false;
    const values = await Promise.all(
      ids.map(async (i) =>
        parseInt((await hash(`${challenge}:leaf:${i}`)).slice(0, 4), 16),
      ),
    );
    return (
      JSON.stringify(values) === JSON.stringify(p.values) &&
      p.xor === 0 &&
      ids[0] < ids[1] &&
      ids[2] < ids[3] &&
      values[0] >>> 8 === values[1] >>> 8 &&
      values[2] >>> 8 === values[3] >>> 8 &&
      (values[0] ^ values[1] ^ values[2] ^ values[3]) === 0
    );
  }
  if (id === "cuckoo") {
    const ids = p.edgeIds as number[];
    if (
      !Array.isArray(ids) ||
      ids.length !== 4 ||
      new Set(ids).size !== 4 ||
      ids.some((i) => !Number.isInteger(i) || i < 0 || i >= parameter)
    )
      return false;
    const degrees = new Map<number, number>();
    const pairs = new Set<string>();
    for (const i of ids) {
      const v = await hash(`${challenge}:edge:${i}`);
      const u = parseInt(v.slice(0, 2), 16) % 8,
        w = 8 + (parseInt(v.slice(2, 4), 16) % 8);
      pairs.add(`${u},${w}`);
      for (const n of [u, w]) degrees.set(n, (degrees.get(n) ?? 0) + 1);
    }
    return (
      Array.isArray(p.nodes) &&
      JSON.stringify([...degrees.keys()].sort((a, b) => a - b)) ===
        JSON.stringify(p.nodes) &&
      pairs.size === 4 &&
      degrees.size === 4 &&
      [...degrees.values()].every((d) => d === 2)
    );
  }
  if (id === "primecoin") {
    const start = 2 + (word(await hash(challenge)) % 1000);
    const chain = p.chain as number[];
    return (
      Array.isArray(chain) &&
      p.start === start &&
      p.origin === chain[0] &&
      chain.length === parameter &&
      chain[0] >= start &&
      chain[0] < start + 20000 &&
      chain.every(
        (v, i) =>
          Number.isSafeInteger(v) &&
          prime(v) &&
          (i === 0 || v === 2 * chain[i - 1] + 1),
      )
    );
  }
  if (id === "vdf") {
    const { x, y, pi, l, steps, modulus } = p;
    if (
      ![x, y, pi, modulus].every(
        (v) => typeof v === "string" && /^\d{1,8}$/.test(v),
      ) ||
      !Number.isSafeInteger(l)
    )
      return false;
    if (BigInt(y) >= 1022117n || BigInt(pi) >= 1022117n) return false;
    const expected = await vdf(challenge, 0, hash); // derive the bound input without repeating the square chain
    if (x !== expected.proof.x || modulus !== "1022117" || steps !== parameter)
      return false;
    let expectedL =
      257 + (word(await hash(`${modulus}:${x}:${y}:${steps}`)) % 1000);
    while (!prime(expectedL)) expectedL++;
    if (l !== expectedL) return false;
    const n = BigInt(modulus),
      r = modpow(2n, BigInt(steps), BigInt(l));
    return (
      (modpow(BigInt(pi), BigInt(l), n) * modpow(BigInt(x), r, n)) % n ===
      BigInt(y)
    );
  }
  if (id === "ethash" || id === "etchash") {
    const epochLength =
        id === "etchash" && parameter >= 11700000 ? 60000 : 30000,
      epoch = Math.floor(parameter / epochLength);
    let mix = word(await hash(challenge));
    for (let i = 0; i < 16; i++) {
      const item = word(await hash(`epoch:${epoch}:item:${mix % 64}`));
      mix = (Math.imul(mix, 16777619) ^ item) >>> 0;
    }
    return (
      p.epoch === epoch &&
      p.epochLength === epochLength &&
      p.mix === mix &&
      p.output === (await hash(`${challenge}:${epoch}:${mix}`))
    );
  }
  const fresh = await runModel(id, challenge, parameter);
  return JSON.stringify(fresh.proof) === JSON.stringify(p);
}
