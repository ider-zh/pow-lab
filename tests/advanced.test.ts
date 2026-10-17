import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { advancedLessons } from "../src/advanced/catalog.ts";
import { modelOptions } from "../src/advanced/config.ts";
import { runModel, verifyModel } from "../src/advanced/models.ts";
import type { AdvancedId } from "../src/advanced/config.ts";
for (const lesson of advancedLessons)
  test(`${lesson.id}: browser model / Node / Python agree and generated assets match`, async () => {
    const id = lesson.id,
      parameter = lesson.defaultParameter,
      challenge = "课堂-pow";
    const actual = await runModel(id, challenge, parameter);
    const node = await import(`../examples/${id}.mjs`);
    assert.deepEqual(await node.run(challenge, parameter), actual);
    const pythonName = id === "argon2" ? "argon2_demo" : id;
    const python = execFileSync(
      "python",
      [
        "-c",
        `import sys,json;sys.path.insert(0,'examples');import ${pythonName};print(json.dumps(${pythonName}.run('课堂-pow',${parameter})))`,
      ],
      { encoding: "utf8" },
    );
    assert.deepEqual(JSON.parse(python), actual);
    for (const extension of ["mjs", "py"])
      assert.equal(
        readFileSync(
          `examples/${extension === "py" ? pythonName : id}.${extension}`,
          "utf8",
        ),
        readFileSync(
          `public/examples/${extension === "py" ? pythonName : id}.${extension}`,
          "utf8",
        ),
      );
  });
test("every remaining lesson supplies a complete narrative, experiment and boundary", () => {
  assert.equal(advancedLessons.length, 9);
  assert.equal(new Set(advancedLessons.map((a) => a.id)).size, 9);
  assert.deepEqual(
    Object.keys(modelOptions).sort(),
    advancedLessons.map((a) => a.id).sort(),
  );
  for (const lesson of advancedLessons) {
    assert.equal(lesson.chapters.length, 5);
    assert(lesson.boundary.length > 40);
    assert(lesson.source.startsWith("https://"));
    assert(modelOptions[lesson.id].includes(lesson.defaultParameter as never));
    assert(lesson.math.length > 5);
  }
});
test("all default teaching constructions produce checkable results", async () => {
  for (const lesson of advancedLessons) {
    const output = await runModel(
      lesson.id,
      "hello-pow",
      lesson.defaultParameter,
    );
    assert(
      await verifyModel(
        lesson.id,
        "hello-pow",
        lesson.defaultParameter,
        output,
      ),
      lesson.id,
    );
  }
});
test("verifiers reject altered structural evidence", async () => {
  for (const lesson of advancedLessons) {
    const result = await runModel(
      lesson.id,
      "hello-pow",
      lesson.defaultParameter,
    );
    const changed = structuredClone(result);
    switch (lesson.id) {
      case "equihash":
        changed.proof.indices[0] = changed.proof.indices[1];
        break;
      case "cuckoo":
        changed.proof.edgeIds[0] = changed.proof.edgeIds[1];
        break;
      case "primecoin":
        changed.proof.chain[1]++;
        break;
      case "vdf":
        changed.proof.y = String(Number(changed.proof.y) + 1);
        break;
      case "randomx":
        changed.proof.registers[0] ^= 1;
        break;
      default:
        changed.proof.output = "0".repeat(64);
    }
    assert.equal(
      await verifyModel(
        lesson.id,
        "hello-pow",
        lesson.defaultParameter,
        changed,
      ),
      false,
      lesson.id,
    );
  }
});
test("epoch rules match before activation and diverge at the ETC activation boundary", async () => {
  const oldEth = await runModel("ethash", "epoch-check", 11699999),
    oldEtc = await runModel("etchash", "epoch-check", 11699999);
  assert.deepEqual(oldEth.proof, oldEtc.proof);
  const eth = await runModel("ethash", "epoch-check", 11700000),
    etc = await runModel("etchash", "epoch-check", 11700000);
  assert.equal(eth.proof.epoch, 390);
  assert.equal(etc.proof.epoch, 195);
  assert.equal(etc.proof.epochLength, 60000);
  assert.notEqual(eth.proof.output, etc.proof.output);
});
test("teaching parameter choices bound worker work and reject arbitrary resource requests", async () => {
  for (const lesson of advancedLessons) {
    await assert.rejects(() => runModel(lesson.id, "hello", 999999999));
    await assert.rejects(() =>
      runModel(lesson.id, "a".repeat(81), lesson.defaultParameter),
    );
  }
  await assert.rejects(() => runModel("unknown" as AdvancedId, "hello", 64));
  for (const id of ["randomx", "kheavyhash", "vdf", "argon2"] as const)
    for (const p of modelOptions[id]) {
      const result = await runModel(id, "parameter-check", p);
      assert(await verifyModel(id, "parameter-check", p, result));
    }
});

test("every advertised parameter executes consistently in the Node example", async () => {
  for (const lesson of advancedLessons) {
    const node = await import(`../examples/${lesson.id}.mjs`);
    for (const parameter of modelOptions[lesson.id]) {
      assert.deepEqual(
        await node.run("options-check", parameter),
        await runModel(lesson.id, "options-check", parameter),
        `${lesson.id}:${parameter}`,
      );
    }
  }
});
