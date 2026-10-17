import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import python from "shiki/langs/python.mjs";
import javascript from "shiki/langs/javascript.mjs";
import theme from "shiki/themes/github-dark-dimmed.mjs";
const highlighter = createHighlighterCore({
  themes: [theme],
  langs: [python, javascript],
  engine: createJavaScriptRegexEngine(),
});
export async function highlight(code: string, language: string) {
  return (await highlighter).codeToHtml(code, {
    lang: language === "python" ? "python" : "javascript",
    theme: "github-dark-dimmed",
  });
}
