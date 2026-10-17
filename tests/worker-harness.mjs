// Node transport shim exercises the same worker module used in the browser.
import { parentPort } from "node:worker_threads";
globalThis.self = { postMessage: (data) => parentPort.postMessage(data) };
await import("../src/worker.ts");
parentPort.on("message", (data) => self.onmessage({ data }));
