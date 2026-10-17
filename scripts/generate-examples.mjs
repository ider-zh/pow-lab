import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const source = fs.readFileSync("src/advanced/kernels.ts", "utf8");
const defaults = {
  argon2: 64,
  equihash: 256,
  cuckoo: 64,
  ethash: 11700000,
  etchash: 11700000,
  randomx: 16,
  primecoin: 4,
  kheavyhash: 4,
  vdf: 256,
};
const options = {
  argon2: [64, 256, 1024],
  equihash: [64, 128, 256],
  cuckoo: [32, 64, 96],
  ethash: [11699999, 11700000, 12000000],
  etchash: [11699999, 11700000, 12000000],
  randomx: [8, 16, 32],
  primecoin: [3, 4, 5],
  kheavyhash: [4, 8],
  vdf: [128, 256, 512],
};
const helper = source.slice(
  source.indexOf("export const word"),
  source.indexOf("// BEGIN equihash"),
);
for (const id of Object.keys(defaults)) {
  const name = ["ethash", "etchash"].includes(id) ? "dataset" : id;
  const segment =
    id === "argon2"
      ? ""
      : source.split(`// BEGIN ${name}\n`)[1].split(`// END ${name}`)[0];
  const imports =
    id === "argon2"
      ? "// npm install hash-wasm\nimport {argon2id} from 'hash-wasm';"
      : "import {createHash} from 'node:crypto';\nconst h=async text=>createHash('sha256').update(text,'utf8').digest('hex');";
  const body =
    id === "argon2"
      ? `const output=await argon2id({password:challenge,salt:'pow-lab-argon2-v1',iterations:2,parallelism:1,memorySize:parameter,hashLength:32,outputType:'hex'});return {kind:'argon2',proof:{output,memoryKiB:parameter,iterations:2,parallelism:1},stats:{parameterMemoryKiB:parameter,passes:2},trace:[]};`
      : `return ${name}(challenge,parameter,h${id === "etchash" ? ",true" : ""});`;
  const text = `// ${id}: ${id === "argon2" ? "real Argon2id with teaching parameters" : "bounded structural teaching model; see the lesson for protocol differences"}.\n${imports}\nimport {pathToFileURL} from 'node:url';\n${id === "argon2" ? "" : stripTypeScriptTypes(helper + segment)}\nexport async function run(challenge='hello-pow',parameter=${defaults[id]}){\n if(!${JSON.stringify(options[id])}.includes(parameter)||typeof challenge!=='string'||challenge.length>80)throw Error('Unsupported teaching parameters');\n ${body}\n}\nif(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(await run(process.argv[2]??'hello-pow',Number(process.argv[3]??${defaults[id]}))));\n`;
  for (const dir of ["examples", "public/examples"])
    fs.writeFileSync(`${dir}/${id}.mjs`, text);
}
