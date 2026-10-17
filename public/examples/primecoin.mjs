// primecoin: bounded structural teaching model; see the lesson for protocol differences.
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
export async function primecoin(
  challenge        ,
  length        ,
  h      ,
)                  {
  const start = 2 + (word(await h(challenge)) % 1000);
  let tested = 0;
  for (let origin = start; origin < start + 20000; origin++) {
    tested++;
    const chain           = [];
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

export async function run(challenge='hello-pow',parameter=4){
 if(![3,4,5].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 return primecoin(challenge,parameter,h);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??4))));
