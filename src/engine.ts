import { sha256, scrypt } from 'hash-wasm';
export type Algorithm = 'hashcash' | 'sha256d' | 'scrypt';
export async function digest(algorithm: Algorithm, challenge: string, nonce: number, N = 1024) {
  const input = new TextEncoder().encode(`${challenge}:${nonce}`);
  if (algorithm === 'scrypt') return scrypt({password: input, salt: 'pow-lab-v1', costFactor: N, blockSize: 8, parallelism: 1, hashLength: 32});
  const first = await sha256(input);
  return algorithm === 'sha256d' ? sha256(Uint8Array.from(first.match(/../g)!, x => parseInt(x,16))) : first;
}
export function accepts(hash: string, difficulty: number) { return hash.startsWith('0'.repeat(difficulty)); }
export function validate(difficulty: number, N: number) {
 if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 4) throw Error('难度请选择 1–4');
 if (![1024,2048,4096].includes(N)) throw Error('请选择支持的内存参数');
}
