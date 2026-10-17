import { useEffect, useRef, useState } from "react";
import { cdf, distribution, quantile } from "./statistics";
import type { BatchUpdate } from "./statistics";
import { downloadJson } from "./download";
export default function ProbabilityLab() {
  const [algorithm, setAlgorithm] = useState<"hashcash" | "sha256d">(
    "hashcash",
  );
  const [seed, setSeed] = useState("pow-probability-01");
  const [difficulty, setDifficulty] = useState(1);
  const [count, setCount] = useState(30);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BatchUpdate | null>(null);
  const [error, setError] = useState("");
  const [stopped, setStopped] = useState(false);
  const worker = useRef<Worker | null>(null);
  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    setRunning(false);
  };
  useEffect(() => () => worker.current?.terminate(), []);
  function run() {
    stop();
    setResult(null);
    setError("");
    setStopped(false);
    setRunning(true);
    const w = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    w.onmessage = ({ data }) => {
      if (worker.current !== w) return;
      if (data.type === "error") setError(data.message);
      else setResult(data);
      if (data.type !== "batch-progress") stop();
    };
    w.onerror = (e) => {
      setError(e.message);
      stop();
    };
    w.postMessage({ mode: "batch", algorithm, seed, difficulty, count });
  }
  const trials = result?.trials ?? [];
  const d = result?.config.difficulty ?? difficulty;
  const expected = 16 ** d;
  const bins = distribution(
    trials.map((t) => t.attempts),
    d,
  );
  const maxBar = Math.max(1, ...bins.flatMap((b) => [b.observed, b.expected]));
  const mean = trials.length
    ? trials.reduce((s, t) => s + t.attempts, 0) / trials.length
    : 0;
  const incomplete = stopped || result?.type === "batch-timeout";
  return (
    <main className="section probability">
      <div className="eyebrow">CHANCE AND COMPUTATION / 概率与运气</div>
      <h1>
        同一道题，
        <br />
        <span>有人幸运，有人久等。</span>
      </h1>
      <p className="lead">
        同一个难度，为什么一次很快，一次很慢？
        <br />
        一次搜索里的偶然，重复很多次之后，会留下什么形状？
      </p>
      <div className="probability-prose">
        <h2>平均值，并不是一条截止线。</h2>
        <p>
          假设每次尝试的命中概率都是 1/16。平均需要 16 次，并不意味着第 16
          次一定成功；前面没有找到答案，也不会让下一次更容易命中。在这个模型里，每次都像重新抽一张签。
        </p>
        <p>
          把许多次等待放在一起，短等待通常多一些，特别长的等待少一些。这种首次成功前的等待，可以用几何分布描述。下面的实验台会留下真实搜索记录，也画出理论分布，看看两者怎样相遇。
        </p>
      </div>
      <section className="panel">
        <div className="panel-title">
          <h2>
            <small>01</small> 留下一组真实的等待
          </h2>
          <span className="pill">Worker · 真实重复计算</span>
        </div>
        <div className="batch-parameters">
          <label>
            算法
            <select
              value={algorithm}
              disabled={running}
              onChange={(e) => {
                setAlgorithm(e.target.value as typeof algorithm);
                setResult(null);
                setStopped(false);
              }}
            >
              <option value="hashcash">Hashcash / SHA-256</option>
              <option value="sha256d">SHA-256d</option>
            </select>
          </label>
          <label>
            难度
            <select
              value={difficulty}
              disabled={running}
              onChange={(e) => {
                setDifficulty(+e.target.value);
                setResult(null);
                setStopped(false);
              }}
            >
              <option value={1}>1 个零 · 期望 16 次</option>
              <option value={2}>2 个零 · 期望 256 次</option>
            </select>
          </label>
          <label>
            重复次数
            <select
              value={count}
              disabled={running}
              onChange={(e) => {
                setCount(+e.target.value);
                setResult(null);
                setStopped(false);
              }}
            >
              {[10, 30, 100].map((n) => (
                <option key={n} value={n}>
                  {n} 次
                </option>
              ))}
            </select>
          </label>
          <label>
            实验种子
            <input
              maxLength={60}
              value={seed}
              disabled={running}
              onChange={(e) => {
                setSeed(e.target.value);
                setResult(null);
                setStopped(false);
              }}
            />
          </label>
        </div>
        <div className="batch-start">
          <button
            onClick={
              running
                ? () => {
                    stop();
                    setStopped(true);
                  }
                : run
            }
          >
            {running ? "停止实验 ■" : "开始重复实验 ↗"}
          </button>
          <button
            className="secondary"
            disabled={running}
            onClick={() => {
              setSeed(crypto.randomUUID().slice(0, 12));
              setResult(null);
              setStopped(false);
            }}
          >
            换一组挑战
          </button>
          <span>30 秒 / 100 万次总预算</span>
        </div>
        <p className="footnote">
          每轮输入为 seed + ":trial:" +
          轮次；相同种子可以复现尝试次数。更换种子观察另一组样本，耗时随设备环境变化。
        </p>
      </section>
      <section className="panel">
        <div className="panel-title">
          <h2>
            <small>02</small> 观察分布
          </h2>
          <span className="pill">
            {running
              ? "计算中"
              : incomplete
                ? "部分样本"
                : result
                  ? "已完成"
                  : "等待实验"}{" "}
            · {trials.length} / {result?.config.count ?? count}
          </span>
        </div>
        <div className="batch-metrics">
          <div>
            <small>理论均值</small>
            <b>{expected}</b>
          </div>
          <div>
            <small>样本均值 {incomplete ? "（已完成部分）" : ""}</small>
            <b>{trials.length ? mean.toFixed(1) : "—"}</b>
          </div>
          <div>
            <small>{stopped ? "最近回传尝试数" : "累计尝试次数"}</small>
            <b>{result?.totalAttempts.toLocaleString() ?? "—"}</b>
          </div>
          <div>
            <small>{stopped ? "最近回传用时" : "实验用时"}</small>
            <b>{result ? `${(result.elapsed / 1000).toFixed(3)} s` : "—"}</b>
          </div>
        </div>
        {incomplete && (
          <p className="notice">
            本组实验保留已完成样本。提前终止可能漏掉耗时较长的轮次，当前均值用于描述这部分数据；完整完成后再与理论分布比较。
            {stopped &&
              "手动停止后，次数和耗时显示最后一次回传的值，正在计算的轮次可能还有额外工作。"}
            {result?.unfinishedAttempts
              ? `另有 ${result.unfinishedAttempts} 次尝试属于未完成轮次。`
              : ""}
          </p>
        )}
        <div className="chart-legend">
          <span>
            <i />
            实际频数
          </span>
          <span>
            <i className="theory" />
            理论期望频数
          </span>
        </div>
        <svg
          className="distribution-chart"
          viewBox="0 0 780 300"
          role="img"
          aria-label="实际尝试次数分布与几何分布理论期望对照，下方表格提供精确数据"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((n) => (
            <g key={n}>
              <line
                x1={45}
                x2={760}
                y1={240 - 200 * n}
                y2={240 - 200 * n}
                stroke="#2a383b"
              />
              <text x={35} y={244 - 200 * n} textAnchor="end">
                {(maxBar * n).toFixed(1)}
              </text>
            </g>
          ))}
          {bins.map((b, i) => (
            <g key={b.low}>
              <rect
                x={61 + i * 99}
                y={240 - (200 * b.observed) / maxBar}
                width={30}
                height={(200 * b.observed) / maxBar}
                rx={3}
                fill="#c7ef86"
              />
              <rect
                x={94 + i * 99}
                y={240 - (200 * b.expected) / maxBar}
                width={23}
                height={(200 * b.expected) / maxBar}
                rx={3}
                fill="#6c999e"
              />
              <text x={88 + i * 99} y={268} textAnchor="middle">
                {b.high === Infinity ? `>${b.low}` : `${b.low + 1}–${b.high}`}
              </text>
            </g>
          ))}
          <text x={400} y={294} textAnchor="middle">
            首次成功所需尝试次数
          </text>
        </svg>
        <details>
          <summary>查看分布数据与理论依据</summary>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>尝试次数区间</th>
                  <th>实际频数</th>
                  <th>理论期望频数</th>
                </tr>
              </thead>
              <tbody>
                {bins.map((b) => (
                  <tr key={b.low}>
                    <td>
                      {b.high === Infinity
                        ? `大于 ${b.low}`
                        : `${b.low + 1}–${b.high}`}
                    </td>
                    <td>{b.observed}</td>
                    <td>{b.expected.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="footnote">
            理论期望频数 = 已完成轮数 ×
            Pr(区间)。哈希输出按均匀、独立随机建模；实际算法对固定输入产生确定结果。
          </p>
        </details>
        {error && <p role="alert">{error}</p>}
      </section>
      <section className="panel">
        <h2>
          <small>03</small> 用数学解释等待
        </h2>
        <div className="math">Pr(X ≤ n) = 1 − (1 − 16⁻ᵈ)ⁿ</div>
        <div className="insight-grid">
          <article>
            <b>{(cdf(expected, d) * 100).toFixed(1)}%</b>
            <p>在“平均次数”内找到答案的概率。平均值不是截止线。</p>
          </article>
          <article>
            <b>{quantile(0.5, d)} 次</b>
            <p>至少一半的独立实验会在这个次数内命中。</p>
          </article>
          <article>
            <b>{quantile(0.95, d)} 次</b>
            <p>达到约 95% 累计成功概率所需的尝试次数。</p>
          </article>
        </div>
        <p>
          将难度从 1 改成
          2，平均工作量会增加多少？这里可以用更多次真实搜索，看看运气背后的分布。
          样本越多，整体形状通常越接近理论；单次等待始终有随机波动。
        </p>
      </section>
      {trials.length > 0 && (
        <section className="panel">
          <div className="panel-title">
            <h2>
              <small>04</small> 留下可复查的记录
            </h2>
            <button
              className="secondary"
              disabled={running}
              onClick={() =>
                downloadJson("pow-lab-probability.json", {
                  schemaVersion: 1,
                  exportedAt: new Date().toISOString(),
                  implementation: "pow-lab / hash-wasm",
                  inputEncoding: 'UTF8(challenge + ":" + decimal_nonce)',
                  scope: incomplete ? "partial" : "complete",
                  ...result,
                })
              }
            >
              导出实验 JSON ↗
            </button>
          </div>
          <p className="footnote">
            记录包含每轮挑战、nonce、哈希、尝试次数与耗时，可用仓库中的 Python /
            Node.js digest 函数逐轮复查。
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>轮次</th>
                  <th>尝试次数</th>
                  <th>耗时 / ms</th>
                  <th>Nonce</th>
                  <th>复算验证</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((t, i) => (
                  <tr key={t.challenge}>
                    <td>{i + 1}</td>
                    <td>{t.attempts.toLocaleString()}</td>
                    <td>{t.elapsed.toFixed(2)}</td>
                    <td>{t.nonce}</td>
                    <td>{t.verified ? "通过" : "待检查"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <div className="lesson-nav">
        <a href="#hashcash">← 接着读 Hashcash 的故事</a>
        <a href="#atlas">探索算法图谱 →</a>
      </div>
    </main>
  );
}
