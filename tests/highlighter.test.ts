import { test } from "node:test";
import assert from "node:assert/strict";
import { highlight } from "../src/highlighter.ts";
test("highlighting supports both teaching languages and escapes source markup", async () => {
  for (const [language, code] of [
    ["python", 'print("<script>alert(1)</script>")'],
    ["nodejs", 'const value = "<img src=x>";'],
  ]) {
    const html = await highlight(code, language);
    assert(html.includes('class="shiki'));
    assert(html.includes("<span style="));
    assert(!html.includes("<script>"));
    assert(!html.includes("<img src=x>"));
    assert(/&(?:lt;|#x3[cC];|#60;)/.test(html));
  }
});
