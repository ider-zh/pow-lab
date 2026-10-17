import { useState, type CSSProperties, type ReactNode } from "react";
import type { IllustrationKind } from "./stories";
import { searchSample, doubleSample } from "./fixtures";
import { digest } from "../engine";
import {
  graphEdges,
  graphAnswer,
  isFourCycle,
  primeChain,
  isPrime,
  matrix,
  vector,
  matrixProduct,
  squareChain,
  epochAt,
  pageValues,
  pageTurn,
  instructions,
  programMemory,
  programState,
  collisionCards,
} from "./illustration-models";

const delay = (index: number) =>
  ({ "--cell-delay": `${index * 45}ms` }) as CSSProperties;
const binary = (n: number) => n.toString(2).padStart(4, "0");
function Fingerprint() {
  const [sample, setSample] = useState(0);
  const current = searchSample.attempts[sample];
  return (
    <>
      <div className="fingerprint-input">
        <span>同一段文字 + 一个可更换的数字</span>
        <code>
          hello-pow:<b>{current.nonce}</b>
        </code>
      </div>
      <div className="fingerprint-press">
        <span>SHA-256</span>
        <i>↓</i>
      </div>
      <div
        className="fingerprint-strip"
        key={sample}
        aria-label={`指纹前16位 ${current.hash.slice(0, 16)}`}
      >
        {current.hash
          .slice(0, 16)
          .split("")
          .map((c, i) => (
            <span
              key={i}
              style={{
                backgroundColor: `hsl(${75 + parseInt(c, 16) * 8} 28% ${19 + parseInt(c, 16) * 2}%)`,
                ...delay(i),
              }}
            >
              {c}
            </span>
          ))}
      </div>
      <div className="plate-controls">
        <button
          onClick={() =>
            setSample((n) => (n + 1) % searchSample.attempts.length)
          }
        >
          换一个数字，看看指纹 ↻
        </button>
        <span>输入相同，指纹相同</span>
      </div>
      <details className="plate-detail">
        <summary>展开完整的 256 位指纹</summary>
        <code>{current.hash}</code>
      </details>
    </>
  );
}
function Search() {
  const [shown, setShown] = useState(0);
  const [checked, setChecked] = useState<"idle" | "checking" | "yes" | "error">(
    "idle",
  );
  const complete = shown === searchSample.attempts.length;
  return (
    <>
      <div className="search-sheet">
        <div className="search-target">
          <span>这次的条件</span>
          <strong>
            <em>0</em> 开头的指纹
          </strong>
          <small>每个方格是一位候选</small>
        </div>
        <div className="search-candidates">
          {searchSample.attempts.map((attempt, i) => (
            <div
              key={i}
              className={`search-candidate ${i < shown ? "candidate-revealed" : ""} ${i < shown && attempt.hit ? "candidate-hit" : ""}`}
              style={delay(i)}
            >
              <span>{i < shown ? attempt.hash.slice(0, 4) : "·"}</span>
              <small>#{attempt.nonce}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="plate-controls">
        <button disabled={complete} onClick={() => setShown((n) => n + 1)}>
          亲手试一次
        </button>
        <button
          className="plate-secondary"
          disabled={complete}
          onClick={() => setShown(searchSample.attempts.length)}
        >
          展开这轮搜索
        </button>
        <button
          className="plate-reset"
          onClick={() => {
            setShown(0);
            setChecked("idle");
          }}
        >
          重来
        </button>
      </div>
      <div className="plate-answer" aria-live="polite">
        {complete ? (
          <>
            <b>第 19 次尝试，nonce = 18 合格。</b>
            <span>发送者交出 18，网站接下来做什么？</span>
            <button
              disabled={checked === "checking" || checked === "yes"}
              onClick={async () => {
                setChecked("checking");
                try {
                  const hash = await digest("hashcash", "hello-pow", 18);
                  setChecked(
                    hash === searchSample.verifiedHash && hash.startsWith("0")
                      ? "yes"
                      : "error",
                  );
                } catch {
                  setChecked("error");
                }
              }}
            >
              {checked === "yes"
                ? "✓ 一次复算，检查通过"
                : checked === "checking"
                  ? "正在复算…"
                  : checked === "error"
                    ? "检查未完成，点击重试"
                    : "替网站检查这个答案"}
            </button>
          </>
        ) : (
          <span>已经尝试 {shown} 次。候选数字按 0、1、2… 依次增加。</span>
        )}
      </div>
    </>
  );
}
function DoubleHash() {
  const [step, setStep] = useState(0);
  const [variant, setVariant] = useState(false);
  const sample = variant ? doubleSample.changed : doubleSample.original;
  return (
    <>
      <div className="double-workbench">
        <div className="double-input">
          <small>输入</small>
          <code>{sample.input}</code>
        </div>
        <div className={`hash-station ${step >= 1 ? "station-done" : ""}`}>
          <span>01</span>
          <b>SHA-256</b>
          <small>{step >= 1 ? "得到 32 个字节" : "等待第一次计算"}</small>
        </div>
        <div className="byte-transfer">
          <i>↓</i>
          {step >= 1 ? (
            <code key={sample.first}>{sample.first.slice(0, 16)}…</code>
          ) : (
            <span>第一轮输出</span>
          )}
        </div>
        <div className={`hash-station ${step >= 2 ? "station-done" : ""}`}>
          <span>02</span>
          <b>SHA-256</b>
          <small>{step >= 2 ? "得到最终指纹" : "接收原始字节"}</small>
        </div>
        <code className="double-output" aria-live="polite">
          {step >= 2 ? sample.second.slice(0, 24) + "…" : "最终结果留在这里"}
        </code>
      </div>
      <div className="plate-controls">
        <button disabled={step === 2} onClick={() => setStep((s) => s + 1)}>
          {step === 0 ? "计算第一轮" : "将原始字节送入第二轮"}
        </button>
        <button
          className="plate-secondary"
          onClick={() => {
            setVariant((v) => !v);
            setStep(0);
          }}
        >
          更换输入，重新观察
        </button>
      </div>
      <p className="plate-observation">
        {step === 2
          ? "两道工序完成。每次换候选，都会重新经过它们。"
          : step === 1
            ? "停在这里看看：第二轮的输入，就是刚得到的 32 个字节。"
            : "先完成第一轮，再看看它把什么交给第二轮。"}
      </p>
    </>
  );
}
function Scratchpad({ reads = false }: { reads?: boolean } = {}) {
  const [size, setSize] = useState(12);
  const [written, setWritten] = useState(false);
  const [read, setRead] = useState(0);
  const path = [3, 8, 2, 10, 6];
  return (
    <>
      <div className={`scratch-desk ${reads ? "scratch-reading" : ""}`}>
        <div className="scratch-margin">
          <span>{reads ? "回头翻格" : "保存中间结果"}</span>
          <b>
            {reads
              ? String(read).padStart(2, "0")
              : String(size).padStart(2, "0")}
          </b>
          <small>{reads ? "次读取" : "个状态格"}</small>
        </div>
        <div className="scratch-grid" key={`${size}-${written}`}>
          {Array.from({ length: reads ? 12 : size }, (_, i) => (
            <div
              className={`scratch-cell ${reads || written ? "cell-written" : ""} ${reads && read > 0 && path[read - 1] === i ? "cell-reading" : ""}`}
              style={delay(i)}
              key={i}
            >
              <span>{String(i).padStart(2, "0")}</span>
              <i />
              <i />
              <i />
            </div>
          ))}
        </div>
      </div>
      {reads ? (
        <>
          <div className="plate-controls">
            <button
              disabled={read === path.length}
              onClick={() => setRead((n) => n + 1)}
            >
              读取一格，再混合 →
            </button>
            <button className="plate-reset" onClick={() => setRead(0)}>
              重新翻格
            </button>
          </div>
          <p className="plate-observation" aria-live="polite">
            {read > 0
              ? `读取第 ${path[read - 1]} 格 → 与当前状态混合 → 新状态决定后面的访问。`
              : "草稿纸已写好。下一次读哪里，由当前状态决定。"}
          </p>
        </>
      ) : (
        <div className="plate-controls">
          <button onClick={() => setWritten((v) => !v)}>
            {written ? "清空草稿纸" : "依次写入状态"}
          </button>
          <button
            className="plate-secondary"
            onClick={() => {
              setSize((n) => (n === 12 ? 24 : 12));
              setWritten(false);
            }}
          >
            换成 {size === 12 ? 24 : 12} 格草稿纸
          </button>
        </div>
      )}
    </>
  );
}
function ArgonTable() {
  const [size, setSize] = useState(16);
  const [rounds, setRounds] = useState(2);
  const [done, setDone] = useState(0);
  return (
    <>
      <div className="argon-dials">
        <label>
          内存示意
          <select
            value={size}
            onChange={(e) => {
              setSize(+e.target.value);
              setDone(0);
            }}
          >
            <option value={8}>8 个格子</option>
            <option value={16}>16 个格子</option>
            <option value={24}>24 个格子</option>
          </select>
        </label>
        <label>
          遍历轮数
          <select
            value={rounds}
            onChange={(e) => {
              setRounds(+e.target.value);
              setDone(0);
            }}
          >
            <option value={1}>1 轮</option>
            <option value={2}>2 轮</option>
            <option value={3}>3 轮</option>
          </select>
        </label>
      </div>
      <div className="argon-table" key={`${size}-${done}`}>
        {Array.from({ length: size }, (_, i) => (
          <div
            key={i}
            className={done > 0 ? "argon-filled" : ""}
            style={delay(i)}
          >
            <span>{i + 1}</span>
            {done > 0 && <b>{"·".repeat(done)}</b>}
          </div>
        ))}
      </div>
      <div className="plate-controls">
        <button
          disabled={done === rounds}
          onClick={() => setDone((n) => n + 1)}
        >
          填写一轮
        </button>
        <button className="plate-reset" onClick={() => setDone(0)}>
          清空
        </button>
        <span aria-live="polite">
          已完成 {done} / {rounds} 轮 · 本轮计划处理 {size * rounds} 格次
        </span>
      </div>
    </>
  );
}
function Collision() {
  const [step, setStep] = useState(0);
  const pairs = [
    collisionCards[0] ^ collisionCards[1],
    collisionCards[2] ^ collisionCards[3],
  ];
  return (
    <>
      <div className={`collision-table collision-step-${step}`}>
        <div className="collision-groups">
          {[0, 1].map((pair) => (
            <div className="collision-pair" key={pair}>
              {step >= 1 && <small>相同前缀 {pair === 0 ? "10" : "01"}</small>}
              <div>
                {[0, 1].map((n) => (
                  <div className="collision-card" key={n}>
                    <span>#{pair * 2 + n}</span>
                    <code>
                      <b>{binary(collisionCards[pair * 2 + n]).slice(0, 2)}</b>
                      {binary(collisionCards[pair * 2 + n]).slice(2)}
                    </code>
                  </div>
                ))}
              </div>
              {step >= 1 && (
                <code className="collision-result">
                  ⊕ {binary(pairs[pair])}
                </code>
              )}
            </div>
          ))}
        </div>
        {step === 2 && (
          <div className="collision-zero">
            <span>两组结果再次异或</span>
            <strong>
              {binary(pairs[0])} ⊕ {binary(pairs[1])} ={" "}
              {binary(pairs[0] ^ pairs[1])}
            </strong>
            <small>留下卡片编号：0、1、2、3</small>
          </div>
        )}
      </div>
      <div className="plate-controls">
        <button disabled={step === 2} onClick={() => setStep((n) => n + 1)}>
          {step === 0 ? "按相同前缀配对" : "合并两组结果"}
        </button>
        <button className="plate-reset" onClick={() => setStep(0)}>
          重新摆卡片
        </button>
      </div>
    </>
  );
}
function Cycle() {
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const valid = isFourCycle(selected);
  return (
    <>
      <div className="cycle-paper">
        <svg viewBox="0 0 560 300" aria-hidden="true">
          {graphEdges.map(([a, b], i) => (
            <line
              key={i}
              x1={95}
              y1={35 + a * 75}
              x2={465}
              y2={35 + (b - 4) * 75}
              className={
                selected.includes(i)
                  ? "graph-selected-edge"
                  : "graph-background-edge"
              }
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <circle
                cx={i < 4 ? 95 : 465}
                cy={35 + (i % 4) * 75}
                r={17}
                className={
                  selected.some((id) =>
                    (graphEdges[id] as readonly number[]).includes(i),
                  )
                    ? "graph-selected-node"
                    : ""
                }
              />
              <text
                x={i < 4 ? 95 : 465}
                y={40 + (i % 4) * 75}
                textAnchor="middle"
              >
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}
          {graphEdges.map(([a, b], i) => {
            const f = 0.25 + (i % 3) * 0.25;
            return (
              <g
                key={i}
                transform={`translate(${95 + 370 * f}, ${35 + a * 75 + ((b - 4) * 75 - a * 75) * f})`}
              >
                <circle r={11} className="edge-label-bg" />
                <text y={4} textAnchor="middle" className="edge-label">
                  {i}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="cycle-edge-choices" role="group" aria-label="选择四条边">
        {graphEdges.map(([a, b], i) => (
          <button
            key={i}
            aria-pressed={selected.includes(i)}
            onClick={() => {
              setChecked(false);
              setSelected((s) =>
                s.includes(i) ? s.filter((n) => n !== i) : [...s, i],
              );
            }}
          >
            <b>{i}</b>
            {String.fromCharCode(65 + a)}—{String.fromCharCode(65 + b)}
          </button>
        ))}
      </div>
      <div className="plate-controls">
        <button onClick={() => setChecked(true)}>
          检查选中的 {selected.length} 条边
        </button>
        <button
          className="plate-secondary"
          onClick={() => {
            setSelected([...graphAnswer]);
            setChecked(true);
          }}
        >
          看一个环
        </button>
        <button
          className="plate-reset"
          onClick={() => {
            setSelected([]);
            setChecked(false);
          }}
        >
          清空
        </button>
      </div>
      <p className="plate-observation" aria-live="polite">
        {checked
          ? valid
            ? "✓ 这四条边连成一个环。四个节点各连接两条选中的边。"
            : "继续试试：选出四条边，让它们连成一条闭合路径。"
          : "从一个节点出发，沿选中的边，能回到起点吗？"}
      </p>
    </>
  );
}
function Dataset() {
  const [states, setStates] = useState([5]);
  const state = states.at(-1)!;
  const last = states.length > 1 ? pageTurn(states.at(-2)!) : null;
  return (
    <>
      <div className="dataset-book">
        <div className="dataset-spine">SHARED DATA / 共享数据</div>
        <div className="dataset-pages">
          {pageValues.map((v, i) => (
            <div className={last?.index === i ? "page-active" : ""} key={i}>
              <small>页 {i}</small>
              <b>{v}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="dataset-state" aria-live="polite">
        {last ? (
          <>
            <span>旧状态 {states.at(-2)}</span>
            <i>⊕</i>
            <span>
              页 {last.index} 的值 {last.value}
            </span>
            <i>+ 1 →</i>
            <strong>新状态 {state}</strong>
          </>
        ) : (
          <>
            <span>当前状态</span>
            <strong>{state}</strong>
            <span>下一页：状态除以 16 的余数</span>
          </>
        )}
      </div>
      <div className="plate-controls">
        <button
          disabled={states.length >= 9}
          onClick={() => setStates((s) => [...s, pageTurn(s.at(-1)!).next])}
        >
          按当前状态翻下一页 →
        </button>
        <button className="plate-reset" onClick={() => setStates([5])}>
          回到起点
        </button>
      </div>
    </>
  );
}
function Epoch() {
  const [block, setBlock] = useState(11700000);
  const [compare, setCompare] = useState(true);
  const legacy = epochAt(block, false),
    adjusted = epochAt(block, true);
  return (
    <>
      <div className="epoch-selector" role="group" aria-label="选择区块高度">
        {[11699999, 11700000, 12000000].map((v) => (
          <button
            key={v}
            aria-pressed={block === v}
            onClick={() => setBlock(v)}
          >
            {v.toLocaleString()}
          </button>
        ))}
      </div>
      <div className="epoch-rulers">
        <div>
          <span>Ethash · 每 30000 块分组</span>
          <div className="epoch-ticks">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <b>epoch {legacy}</b>
        </div>
        {compare && (
          <div className="adjusted-ruler">
            <span>
              Etchash ·{" "}
              {block < 11700000
                ? "分叉前，仍为 30000"
                : "分叉后，按 60000 分组"}
            </span>
            <div className="epoch-ticks">
              {Array.from({ length: block < 11700000 ? 12 : 6 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <b>epoch {adjusted}</b>
          </div>
        )}
      </div>
      <div className="plate-controls">
        <button
          className="plate-secondary"
          onClick={() => setCompare((v) => !v)}
        >
          {compare ? "收起第二把尺" : "展开 Etchash 的尺"}
        </button>
        <span>刻度示意相同区块跨度内的分组密度</span>
      </div>
    </>
  );
}
function Program() {
  const [step, setStep] = useState(0);
  const states = programState(step);
  const current = states.at(-1)!;
  return (
    <>
      <div className="program-desk">
        <ol className="program-list">
          {instructions.map((instruction, i) => (
            <li
              className={
                i < step
                  ? "instruction-done"
                  : i === step
                    ? "instruction-next"
                    : ""
              }
              key={i}
            >
              <span>0{i + 1}</span>
              <code>{instruction}</code>
              <b>{i < step ? "✓" : ""}</b>
            </li>
          ))}
        </ol>
        <div className="program-registers">
          <div>
            <span>寄存器 A</span>
            <b key={`a${current.a}`}>{current.a}</b>
          </div>
          <div>
            <span>寄存器 B</span>
            <b key={`b${current.b}`}>{current.b}</b>
          </div>
          <small>内存 [ {programMemory.join(", ")} ]</small>
        </div>
      </div>
      <div className="plate-controls">
        <button disabled={step === 4} onClick={() => setStep((s) => s + 1)}>
          执行下一条指令 →
        </button>
        <button className="plate-reset" onClick={() => setStep(0)}>
          程序回到开头
        </button>
      </div>
      <p className="plate-observation" aria-live="polite">
        {step === 0
          ? "从 A = 2，B = 3 开始。先执行加法。"
          : step === 4
            ? `程序结束，最终 A = ${current.a}，B = ${current.b}。`
            : `刚执行 ${instructions[step - 1]}，下一条会使用现在的状态。`}
      </p>
    </>
  );
}
function Primes() {
  const [start, setStart] = useState(2);
  const [length, setLength] = useState(1);
  const chain = primeChain(start);
  const shown = chain.slice(0, length);
  const ended = !isPrime(shown.at(-1)!);
  return (
    <>
      <div className="prime-branch" aria-label="当前素数链">
        {shown.map((n, i) => (
          <div className="prime-link" key={`${start}-${i}`}>
            {i > 0 && <span>×2+1 →</span>}
            <div className={isPrime(n) ? "prime-number" : "composite-number"}>
              <b>{n}</b>
              <small>
                {isPrime(n)
                  ? "素数"
                  : `合数 · ${n === 47 * 2 + 1 ? "5 × 19" : n === 15 ? "3 × 5" : "可分解"}`}
              </small>
            </div>
          </div>
        ))}
      </div>
      <div className="plate-controls">
        <button
          disabled={ended || length >= chain.length}
          onClick={() => setLength((n) => n + 1)}
        >
          尝试下一项 →
        </button>
        <button
          className="plate-secondary"
          onClick={() => {
            setStart((n) => (n === 2 ? 3 : 2));
            setLength(1);
          }}
        >
          从 {start === 2 ? 3 : 2} 开始
        </button>
        <button className="plate-reset" onClick={() => setLength(1)}>
          重新延长
        </button>
      </div>
      <p className="plate-observation" aria-live="polite">
        {ended
          ? `链在 ${shown.at(-1)} 停下。前面连续有 ${shown.length - 1} 个素数。`
          : `已经接上 ${shown.length} 个素数，下一个还会是素数吗？`}
      </p>
    </>
  );
}
function Matrix() {
  const [row, setRow] = useState(0);
  return (
    <>
      <div className="matrix-desk">
        <div className="matrix-grid" aria-label="矩阵">
          {matrix.flatMap((values, i) =>
            values.map((v, j) => (
              <span
                className={i === row ? "matrix-cell-active" : ""}
                key={`${i}-${j}`}
              >
                {v}
              </span>
            )),
          )}
        </div>
        <span className="math-operator">×</span>
        <div className="matrix-vector">
          {vector.map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
        <span className="math-operator">=</span>
        <div className="matrix-result">
          {matrixProduct.map((v, i) => (
            <span className={i === row ? "matrix-cell-active" : ""} key={i}>
              {v}
            </span>
          ))}
        </div>
      </div>
      <div className="matrix-equation" key={row} aria-live="polite">
        {matrix[row].map((v, i) => (
          <span key={i}>
            {i > 0 ? " + " : ""}
            {v} × {vector[i]}
          </span>
        ))}
        <b> = {matrixProduct[row]}</b>
      </div>
      <div className="plate-controls" role="group" aria-label="选择矩阵行">
        {matrix.map((_, i) => (
          <button
            className={row === i ? "" : "plate-secondary"}
            aria-pressed={row === i}
            key={i}
            onClick={() => setRow(i)}
          >
            看第 {i + 1} 行
          </button>
        ))}
      </div>
    </>
  );
}
function Delay() {
  const [steps, setSteps] = useState(0);
  const chain = squareChain(steps);
  return (
    <>
      <div className="delay-path">
        {chain.map((v, i) => (
          <div className="delay-link" key={i}>
            {i > 0 && <span>平方、取余 →</span>}
            <div>
              <small>{i === 0 ? "起点" : `第 ${i} 步`}</small>
              <b>{v}</b>
            </div>
          </div>
        ))}
      </div>
      <div className="delay-equation" aria-live="polite">
        {steps > 0
          ? `${chain.at(-2)}² mod 77 = ${chain.at(-1)}`
          : "起点为 3，模数为 77。下一步先计算 3²。"}
      </div>
      <div className="plate-controls">
        <button disabled={steps === 5} onClick={() => setSteps((n) => n + 1)}>
          用当前结果，推进一步 →
        </button>
        <button className="plate-reset" onClick={() => setSteps(0)}>
          回到起点
        </button>
      </div>
    </>
  );
}
const plates: Record<
  IllustrationKind,
  { label: string; component: () => ReactNode }
> = {
  fingerprint: { label: "改变输入，观察指纹", component: Fingerprint },
  search: { label: "展开搜索，再检查答案", component: Search },
  double: { label: "停在两次哈希之间", component: DoubleHash },
  scratchpad: { label: "给中间状态一个位置", component: Scratchpad },
  "memory-read": {
    label: "回到刚才写下的格子",
    component: () => <Scratchpad reads />,
  },
  argon: { label: "两个旋钮，两种成本", component: ArgonTable },
  collision: { label: "四张卡片，怎样抵消", component: Collision },
  cycle: { label: "在纸上找一个环", component: Cycle },
  dataset: { label: "顺着线索翻下一页", component: Dataset },
  epoch: { label: "同一段高度，两种刻度", component: Epoch },
  program: { label: "让程序走一小步", component: Program },
  primes: { label: "这条链，能走多远", component: Primes },
  matrix: { label: "看清一行里的乘与加", component: Matrix },
  delay: { label: "接住上一步的结果", component: Delay },
};
export default function Illustration({
  kind,
  caption,
}: {
  kind: IllustrationKind;
  caption: string;
}) {
  const plate = plates[kind];
  const Component = plate.component;
  return (
    <figure className={`chapter-plate plate-${kind}`}>
      <div className="plate-heading">
        <span>页边插画</span>
        <b>{plate.label}</b>
        <i>↗</i>
      </div>
      <div className="plate-drawing">
        <Component />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
