// argon2: real Argon2id with teaching parameters.
// npm install hash-wasm
import {argon2id} from 'hash-wasm';
import {pathToFileURL} from 'node:url';

export async function run(challenge='hello-pow',parameter=64){
 if(![64,256,1024].includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');
 const output=await argon2id({password:challenge,salt:'pow-lab-argon2-v1',iterations:2,parallelism:1,memorySize:parameter,hashLength:32,outputType:'hex'});return {kind:'argon2',proof:{output,memoryKiB:parameter,iterations:2,parallelism:1},stats:{parameterMemoryKiB:parameter,passes:2},trace:[]};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??64))));
