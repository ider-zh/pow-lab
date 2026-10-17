// vdf: bounded structural teaching model; see the lesson for protocol differences.
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
export async function vdf(
  challenge        ,
  steps        ,
  h      ,
)                  {
  const modulus = 1022117n;
  let x = BigInt(2 + (word(await h(challenge)) % 1000000));
  while (x % 1009n === 0n || x % 1013n === 0n) x++;
  let y = x;
  const trace                        = [];
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

export async function run(challenge='hello-pow',parameter=256){
 if(![128,256,512].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 return vdf(challenge,parameter,h);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??256))));
