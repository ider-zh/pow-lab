// etchash: bounded structural teaching model; see the lesson for protocol differences.
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
export async function dataset(
  challenge        ,
  block        ,
  h      ,
  etchash = false,
)                  {
  const epochLength = etchash && block >= 11700000 ? 60000 : 30000,
    epoch = Math.floor(block / epochLength);
  const values           = [];
  for (let i = 0; i < 64; i++)
    values.push(word(await h(`epoch:${epoch}:item:${i}`)));
  let mix = word(await h(challenge));
  const trace                        = [];
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

export async function run(challenge='hello-pow',parameter=11700000){
 if(![11699999,11700000,12000000].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 return dataset(challenge,parameter,h,true);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??11700000))));
