import { useEffect, useRef, useState } from "react";
import type { Lesson } from "./catalog";
import { modelOptions } from "./config";
import type { Output } from "./kernels";
import { downloadJson } from "../download";
type Result = {
  output: Output;
  verified: boolean;
  solveMs: number;
  verifyMs: number;
  challenge: string;
  parameter: number;
};
const labels: Record<string, string> = {
  leaves: "候选叶子",
  prefixPairs: "前缀配对",
  edges: "生成边数",
  rectanglesChecked: "检查环候选",
  instructions: "执行指令",
  memoryWords: "模型内存字数",
  datasetItems: "模型数据项",
  accesses: "数据访问",
  block: "区块高度",
  candidates: "搜索候选",
  length: "链长度",
  dimension: "矩阵维度",
  multiplications: "标量乘法",
  sequentialSquarings: "顺序平方",
  parameterMemoryKiB: "参数内存 / KiB",
  passes: "派生轮数",
};
export default function ModelLab({ lesson }: { lesson: Lesson }) {
  const [challenge, setChallenge] = useState("hello-pow");
  const [parameter, setParameter] = useState(lesson.defaultParameter);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [proof, setProof] = useState("");
  const [check, setCheck] = useState<string>("");
  const worker = useRef<Worker | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    setRunning(false);
  };
  useEffect(
    () => () => {
      worker.current?.terminate();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function start(verify = false) {
    stop();
    setError("");
    setCheck("");
    if (!verify) setResult(null);
    setRunning(true);
    const w = new Worker(new URL("../worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    timer.current = setTimeout(() => {
      stop();
      setError("已达到 10 秒工作预算，可调整参数重新运行");
    }, 10000);
    w.onerror = (e) => {
      setError(e.message);
      stop();
    };
    w.onmessage = ({ data }) => {
      if (worker.current !== w) return;
      if (data.type === "error") setError(data.message);
      else if (data.type === "model-verified")
        setCheck(
          data.verified ? "校验通过 ✓" : "当前结构与规则不同，请检查输入",
        );
      else {
        setResult(data);
        setProof(JSON.stringify(data.output, null, 2));
      }
      stop();
    };
    try {
      w.postMessage({
        mode: verify ? "advanced-verify" : "advanced",
        algorithm: lesson.id,
        challenge,
        parameter,
        output: verify ? JSON.parse(proof) : undefined,
      });
    } catch {
      setError("请输入有效 JSON");
      stop();
    }
  }
  return (
    <section className="panel">
      <div className="panel-title">
        <h2>
          <small>02</small> 一个可以复查的算例
        </h2>
        <span className="pill">{lesson.scope}</span>
      </div>
      <p className="model-boundary">{lesson.boundary}</p>
      <div className="model-controls">
        <label>
          挑战 / 输入
          <input
            value={challenge}
            maxLength={80}
            disabled={running}
            onChange={(e) => {
              setChallenge(e.target.value);
              setResult(null);
              setCheck("");
            }}
          />
        </label>
        <label>
          {lesson.control}
          <select
            disabled={running}
            value={parameter}
            onChange={(e) => {
              setParameter(+e.target.value);
              setResult(null);
              setCheck("");
            }}
          >
            {modelOptions[lesson.id].map((n) => (
              <option key={n} value={n}>
                {lesson.optionLabels?.[n] ?? n.toLocaleString()}
              </option>
            ))}
          </select>
        </label>
        <button onClick={running ? stop : () => start()}>
          {running ? "停止 ■" : "运行算例 ↗"}
        </button>
      </div>
      <p className="footnote">
        Worker 内实际执行 · 单次 10 秒预算 · 停止后可重新运行
      </p>
      {error && <p role="alert">{error}</p>}
      {result && (
        <>
          <div className="model-summary">
            <div>
              <small>计算耗时</small>
              <b>{result.solveMs.toFixed(2)} ms</b>
            </div>
            <div>
              <small>检查耗时</small>
              <b>{result.verifyMs.toFixed(2)} ms</b>
            </div>
            <div>
              <small>结构检查 / 复算</small>
              <b>{result.verified ? "通过 ✓" : "本预算内未获得结构解"}</b>
            </div>
          </div>
          <div className="model-stats">
            {Object.entries(result.output.stats).map(([key, value]) => (
              <span key={key}>
                {labels[key] ?? key}
                <b>{value.toLocaleString()}</b>
              </span>
            ))}
          </div>
          {lesson.id === "cuckoo" && (
            <svg
              className="model-graph"
              viewBox="0 0 600 280"
              role="img"
              aria-label="模型生成的二部图，证明中的四条边高亮"
            >
              {result.output.trace.map((e, i) => (
                <line
                  key={i}
                  x1={110}
                  y1={22 + e.u * 33}
                  x2={490}
                  y2={22 + (e.v - 8) * 33}
                  stroke={
                    (result.output.proof.edgeIds as number[]).includes(e.id)
                      ? "#c7ef86"
                      : "#2c4040"
                  }
                  strokeWidth={
                    (result.output.proof.edgeIds as number[]).includes(e.id)
                      ? 3
                      : 1
                  }
                />
              ))}
              {Array.from({ length: 16 }, (_, i) => (
                <g key={i}>
                  <circle
                    cx={i < 8 ? 110 : 490}
                    cy={22 + (i % 8) * 33}
                    r={9}
                    fill="#c7ef86"
                  />
                  <text
                    x={i < 8 ? 87 : 511}
                    y={26 + (i % 8) * 33}
                    fill="#93aaa3"
                    textAnchor="middle"
                    fontSize={12}
                  >
                    {i}
                  </text>
                </g>
              ))}
            </svg>
          )}
          {lesson.id === "primecoin" && (
            <div className="prime-chain-result">
              {(result.output.proof.chain as number[]).map((p, i) => (
                <span key={p}>
                  {i > 0 && <i>→</i>}
                  <b>{p}</b>
                </span>
              ))}
            </div>
          )}
          <details open>
            <summary>查看计算结果与可复查结构</summary>
            <pre className="model-json">
              {JSON.stringify(result.output.proof, null, 2)}
            </pre>
          </details>
          <details>
            <summary>查看执行记录 · {result.output.trace.length} 条</summary>
            <pre className="model-json">
              {JSON.stringify(result.output.trace, null, 2)}
            </pre>
          </details>
          <div className="model-actions">
            <button
              className="secondary"
              onClick={() =>
                downloadJson(`pow-lab-${lesson.id}.json`, {
                  schemaVersion: 1,
                  scope: lesson.scope,
                  boundary: lesson.boundary,
                  algorithm: lesson.id,
                  ...result,
                })
              }
            >
              导出算例 JSON
            </button>
          </div>
          <details>
            <summary>修改证据，重新检查</summary>
            <p className="footnote">
              检查证据结构或复算结果；统计和执行记录用于观察。
            </p>
            <label>
              算例 JSON
              <textarea
                className="proof-editor"
                value={proof}
                disabled={running}
                onChange={(e) => {
                  setProof(e.target.value);
                  setCheck("");
                }}
              />
            </label>
            <button
              className="secondary"
              disabled={running}
              onClick={() => start(true)}
            >
              检查当前证据
            </button>
            {check && <p role="status">{check}</p>}
          </details>
        </>
      )}
    </section>
  );
}
