import { useState } from "react";
import type { SearchResult } from "./search";
export default function TraceReplay({ result }: { result: SearchResult }) {
  const [index, setIndex] = useState(0);
  const trace = result.trace ?? [];
  if (trace.length === 0) return null;
  const attempt = trace[Math.min(index, trace.length - 1)];
  return (
    <div className="trace-replay">
      <div className="panel-title">
        <h3>回看真实尝试</h3>
        <span className="pill">前 {trace.length} 次 · 真实轨迹</span>
      </div>
      <p>
        每条记录来自本次求解。大规模搜索仅保存前 24
        次与最终证明，累计次数来自完整计算。
      </p>
      <div className="trace-output">
        <span>
          nonce <b>{attempt.nonce}</b>
        </span>
        <code>
          <mark>{attempt.hash.slice(0, result.difficulty)}</mark>
          {attempt.hash.slice(result.difficulty)}
        </code>
      </div>
      <label>
        轨迹位置 · {Math.min(index + 1, trace.length)} / {trace.length}
        <input
          aria-label="真实尝试轨迹位置"
          type="range"
          min={0}
          max={trace.length - 1}
          value={Math.min(index, trace.length - 1)}
          onChange={(e) => setIndex(+e.target.value)}
        />
      </label>
      <div className="controls">
        <button
          className="secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          ← 上一次
        </button>
        <button
          className="secondary"
          disabled={index >= trace.length - 1}
          onClick={() => setIndex((i) => Math.min(trace.length - 1, i + 1))}
        >
          下一次 →
        </button>
      </div>
    </div>
  );
}
