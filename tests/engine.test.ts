import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash,scryptSync} from 'node:crypto';
import {scrypt,sha256} from 'hash-wasm';
import {digest, accepts, validate} from '../src/engine.ts';
test('published SHA-256 and RFC 7914 scrypt vectors',async()=>{
 assert.equal(await sha256('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
 assert.equal(await scrypt({password:'',salt:'',costFactor:16,blockSize:1,parallelism:1,hashLength:64}),'77d6576238657b203b19ca42c18a0497f16b4844e3074ae8dfdffa3fede21442fcd0069ded0948f8326a753a0fc81f17e8d3e0fb2e0d3628cf35e20c38d18906');
});
for(const id of ['hashcash','sha256d','scrypt'] as const) test(`${id}: browser engine / Node / Python agree`,async()=>{
 const challenge='你好:pow',nonce=42;
 const actual=await digest(id,challenge,nonce);
 const node=await import(`../examples/${id}.mjs`);
 assert.equal(actual,node.digest(challenge,nonce));
 const py=execFileSync('python',['-c',`import sys;sys.path.insert(0,'examples');import ${id};print(${id}.digest('你好:pow',42))`],{encoding:'utf8'}).trim();
 assert.equal(actual,py);
 if(id==='sha256d') {const raw=createHash('sha256').update(`${challenge}:${nonce}`).digest();assert.equal(actual,createHash('sha256').update(raw).digest('hex'));}
 if(id==='scrypt') assert.equal(actual,scryptSync(`${challenge}:${nonce}`,'pow-lab-v1',32,{N:1024,r:8,p:1}).toString('hex'));
});
test('target and bounded parameters',()=>{assert(accepts('00af',2));assert(!accepts('01af',2));assert.throws(()=>validate(0,1024));assert.throws(()=>validate(2,8192));validate(2,1024)});
