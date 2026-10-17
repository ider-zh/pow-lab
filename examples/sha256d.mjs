// PoW Lab: sha256d. UTF-8 challenge + ':' + decimal nonce.
import {createHash, scryptSync} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export function digest(challenge, nonce) {
  const data = Buffer.from(`${challenge}:${nonce}`, 'utf8');
  return createHash('sha256').update(createHash('sha256').update(data).digest()).digest().toString('hex');
}
export function solve(challenge = 'hello-pow', difficulty = 2) {
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 4)
    throw Error('difficulty must be 1..4');
  const start = performance.now();
  // Search; the verifier recomputes only the submitted nonce.
  for (let nonce = 0; nonce < 5_000_000; nonce++) {
    const hash = digest(challenge, nonce);
    if (hash.startsWith('0'.repeat(difficulty))) {
      if (digest(challenge, nonce) !== hash) throw Error('verification failed');
      return {nonce, hash, attempts: nonce + 1, seconds: (performance.now()-start)/1000};
    }
    if (performance.now()-start > 15000) throw Error('15 second budget reached');
  }
  throw Error('attempt budget reached');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(solve());
