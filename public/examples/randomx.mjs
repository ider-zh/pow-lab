// randomx: bounded structural teaching model; see the lesson for protocol differences.
import {createHash} from 'node:crypto';
const h=async text=>createHash('sha256').update(text,'utf8').digest('hex');
import {pathToFileURL} from 'node:url';
export const word = (hex        ) => parseInt(hex.slice(0, 8), 16) >>> 0;
export function prime(n        ) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
export function modpow(base        , power        , modulus        ) {
  let result = 1n;
  for (
    base %= modulus;
    power > 0n;
    power >>= 1n, base = (base * base) % modulus
  )
    if (power & 1n) result = (result * base) % modulus;
  return result;
}
export async function randomx(
  challenge        ,
  count        ,
  h      ,
)                  {
  const registers = [1, 2, 3, 4];
  const memory           = [];
  for (let i = 0; i < 32; i++)
    memory.push(word(await h(`${challenge}:memory:${i}`)));
  const trace                        = [];
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

export async function run(challenge='hello-pow',parameter=16){
 if(![8,16,32].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 return randomx(challenge,parameter,h);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??16))));
