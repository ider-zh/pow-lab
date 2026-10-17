import {digest, accepts, validate} from './engine';
self.onmessage = async ({data}) => {
 try {
 const {algorithm, challenge, difficulty, N} = data; validate(difficulty,N);
 const start=performance.now(); let last=start;
 for(let nonce=0;nonce<5_000_000;nonce++) {
  const hash=await digest(algorithm,challenge,nonce,N); const now=performance.now();
  if(accepts(hash,difficulty)) {
   const verifyStart=performance.now(); const verified=accepts(await digest(algorithm,challenge,nonce,N),difficulty);
   self.postMessage({type:'done',nonce,hash,attempts:nonce+1,elapsed:now-start,verifyMs:performance.now()-verifyStart,verified}); return;
  }
  if(now-start>15000) { self.postMessage({type:'timeout',attempts:nonce+1,elapsed:now-start,hash,nonce});return; }
  if(now-last>80) {self.postMessage({type:'progress',nonce,hash,attempts:nonce+1,elapsed:now-start});last=now;}
 }
 self.postMessage({type:'error',message:'已达到本次尝试上限，请重新运行'});
 } catch(e) {self.postMessage({type:'error',message:String(e)});}
};
