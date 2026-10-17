// kheavyhash: bounded structural teaching model; see the lesson for protocol differences.
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
export async function kheavyhash(
  challenge        ,
  size        ,
  h      ,
)                  {
  const input = await h(`${challenge}:input`);
  const vector = input
    .slice(0, size)
    .split("")
    .map((x) => parseInt(x, 16));
  const matrix             = [];
  const product           = [];
  for (let row = 0; row < size; row++) {
    const values           = [];
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

export async function run(challenge='hello-pow',parameter=4){
 if(![4,8].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 return kheavyhash(challenge,parameter,h);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??4))));
