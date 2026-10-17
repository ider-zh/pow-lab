// equihash: bounded structural teaching model; see the lesson for protocol differences.
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
export async function equihash(
  challenge        ,
  count        ,
  h      ,
)                  {
  const values           = [];
  for (let i = 0; i < count; i++)
    values.push(parseInt((await h(`${challenge}:leaf:${i}`)).slice(0, 4), 16));
  const pairs = new Map                  ();
  let matches = 0;
  const trace                        = [];
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

export async function run(challenge='hello-pow',parameter=256){
 if(![64,128,256].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 return equihash(challenge,parameter,h);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??256))));
