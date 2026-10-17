// cuckoo: bounded structural teaching model; see the lesson for protocol differences.
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
export async function cuckoo(
  challenge        ,
  count        ,
  h      ,
)                  {
  const edges                                         = [];
  const lookup = new Map                ();
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

export async function run(challenge='hello-pow',parameter=64){
 if(![32,64,96].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 return cuckoo(challenge,parameter,h);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??64))));
