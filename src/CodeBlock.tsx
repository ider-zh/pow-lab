import { useEffect, useState } from "react";
// Only locally-authored source text is passed to Shiki's escaped HTML renderer.
export default function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    let active = true;
    setHtml("");
    import("./highlighter")
      .then(({ highlight }) => highlight(code, language))
      .then((result) => {
        if (active) setHtml(result);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [code, language]);
  return html ? (
    <div className="code-view" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <pre>
      <code>{code || "正在载入代码…"}</code>
    </pre>
  );
}
