import { useEffect, useState } from "react";
import type { Lesson } from "./catalog";
import AdvancedFilm from "./AdvancedFilm";
import ModelLab from "./ModelLab";
import CodeBlock from "../CodeBlock";
import "./advanced.css";
export default function AdvancedLesson({
  lesson,
  navigation,
}: {
  lesson: Lesson;
  navigation: { id: string; name: string }[];
}) {
  const [language, setLanguage] = useState("python"),
    [code, setCode] = useState(""),
    [copy, setCopy] = useState("复制");
  useEffect(() => {
    let active = true;
    setCode("");
    setCopy("复制");
    fetch(
      `${import.meta.env.BASE_URL}examples/${lesson.id === "argon2" && language === "python" ? "argon2_demo" : lesson.id}.${language === "python" ? "py" : "mjs"}`,
    )
      .then((r) => {
        if (!r.ok) throw Error("代码载入失败");
        return r.text();
      })
      .then((t) => {
        if (active) setCode(t);
      })
      .catch((e) => {
        if (active) setCode(String(e));
      });
    return () => {
      active = false;
    };
  }, [lesson.id, language]);
  const index = navigation.findIndex((a) => a.id === lesson.id);
  return (
    <main className="lesson">
      <aside className="sidebar extended-sidebar">
        <div className="eyebrow">THE ACADEMY / 12 LESSONS</div>
        {navigation.map((a, i) => (
          <a
            key={a.id}
            className={a.id === lesson.id ? "selected" : ""}
            href={"#" + a.id}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {a.name}
            <span>↗</span>
          </a>
        ))}
        <a href="#atlas">算法图谱 →</a>
      </aside>
      <div className="lesson-body">
        <div className="eyebrow">{lesson.tag} · 交互课堂</div>
        <h1>
          {lesson.name}
          <span className="lesson-index">/ LAB</span>
        </h1>
        <p className="lead">{lesson.question}</p>
        <section className="panel film-panel">
          <div className="panel-title">
            <h2>
              <small>01</small> 10 秒看见完整机制
            </h2>
            <span className="pill">全局概览</span>
          </div>
          <AdvancedFilm key={lesson.id} lesson={lesson} />
        </section>
        <ModelLab key={lesson.id} lesson={lesson} />
        <section className="panel">
          <h2>
            <small>03</small> 从直觉走向原理
          </h2>
          <p>{lesson.intuition}</p>
          <h3 className="lesson-subheading">它解决什么问题？</h3>
          <p>{lesson.mechanism}</p>
          <div className="math advanced-math">{lesson.math}</div>
          <p>{lesson.mathText}</p>
          <h3 className="lesson-subheading">带着问题继续研究</h3>
          <p>{lesson.application}</p>
          <a className="source" href={lesson.source}>
            {lesson.sourceName} ↗
          </a>
        </section>
        <section className="panel">
          <div className="panel-title">
            <h2>
              <small>04</small> 阅读与运行代码
            </h2>
            <div className="tabs">
              {["python", "nodejs"].map((l) => (
                <button
                  key={l}
                  className={language === l ? "tab active" : "tab"}
                  onClick={() => setLanguage(l)}
                >
                  {l === "python" ? "Python" : "Node.js"}
                </button>
              ))}
              <button
                className="tab"
                disabled={!code}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code);
                    setCopy("已复制 ✓");
                  } catch {
                    setCopy("请在代码区选择复制");
                  }
                }}
              >
                {copy}
              </button>
            </div>
          </div>
          <p className="footnote">
            {lesson.scope} · 与浏览器实验使用同一输入约定。
            {lesson.id === "argon2"
              ? "Python 依赖：pip install argon2-cffi；Node.js 依赖：npm install hash-wasm。"
              : "示例使用各语言标准库。"}
          </p>
          <CodeBlock code={code} language={language} />
          <p className="footnote">
            运行：
            {language === "python"
              ? `python examples/${lesson.id === "argon2" ? "argon2_demo" : lesson.id}.py`
              : `node examples/${lesson.id}.mjs`}
            。可追加输入字符串和参数，例如：
            {language === "python" ? "python" : "node"} examples/
            {lesson.id === "argon2" && language === "python"
              ? "argon2_demo"
              : lesson.id}
            .{language === "python" ? "py" : "mjs"} hello-pow{" "}
            {lesson.defaultParameter}。
          </p>
          <p className="footnote">模型边界：{lesson.boundary}</p>
        </section>
        <div className="lesson-nav">
          <a href={index > 0 ? "#" + navigation[index - 1].id : "#home"}>
            ← {index > 0 ? navigation[index - 1].name : "首页"}
          </a>
          <a
            href={
              index < navigation.length - 1
                ? "#" + navigation[index + 1].id
                : "#atlas"
            }
          >
            {index < navigation.length - 1
              ? navigation[index + 1].name
              : "算法图谱"}{" "}
            →
          </a>
        </div>
      </div>
    </main>
  );
}
