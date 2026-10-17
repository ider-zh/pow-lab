import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Algorithm } from "./engine";
import "./style.css";
import CodeBlock from "./CodeBlock";
import ReadingStory from "./reading/ReadingStory";
import ReadingExtras from "./reading/ReadingExtras";
import { stories } from "./reading/stories";
import ProbabilityLab from "./ProbabilityLab";
import ProofInspector from "./ProofInspector";
import TraceReplay from "./TraceReplay";
import type { SearchResult } from "./search";
import { advancedLessons, advancedById } from "./advanced/catalog";
import AdvancedLesson from "./advanced/AdvancedLesson";
const algorithms = [
  {
    id: "hashcash",
    name: "Hashcash",
    tag: "01 / 哈希搜索",
    question: "如何让一次请求带上计算的成本？",
    desc: "不断尝试一个数字，直到哈希值满足目标条件。",
    detail:
      "想象一种彩票：每次改变 nonce（尝试用的数字），都会得到一个新的哈希。目标是找到以指定数量的 0 开头的结果。验证者拿到答案后，只需计算一次。这里使用 SHA-256 教学构造；原始 Hashcash 使用 SHA-1 邮件戳格式。",
    formula: 'SHA256(UTF8(challenge + ":" + nonce))',
    source: "http://www.hashcash.org/papers/hashcash.pdf",
  },
  {
    id: "sha256d",
    name: "SHA-256d",
    tag: "02 / 双重哈希",
    question: "一个答案，怎样成为区块的工作证明？",
    desc: "连续进行两次 SHA-256，探索比特币背后的搜索机制。",
    detail:
      "把第一次哈希产生的 32 个字节再送入 SHA-256，然后与目标比较。比特币对区块头执行双重哈希；这里用文本挑战演示同一搜索思想，实际区块头还有独立的序列化与目标规则。",
    formula: "SHA256(bytes(SHA256(input)))",
    source: "https://developer.bitcoin.org/devguide/block_chain.html",
  },
  {
    id: "scrypt",
    name: "Scrypt",
    tag: "03 / 内存困难",
    question: "如果计算还需要一张很大的草稿纸？",
    desc: "用计算与内存一起衡量成本，观察参数如何改变实验。",
    detail:
      "Scrypt 先展开数据，保存大量中间状态，再依照数据访问和混合这些状态。N 控制规模，r 控制块大小，p 控制并行工作参数。本实验将 Scrypt 输出用于前导零搜索，验证也需要执行一次 Scrypt。",
    formula: 'scrypt(input, "pow-lab-v1", N, r=8, p=1)',
    source: "https://www.rfc-editor.org/rfc/rfc7914.html",
  },
];
const navigation = [...algorithms, ...advancedLessons].map(({ id, name }) => ({
  id,
  name,
}));
type Result = SearchResult;
function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "home");
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [challenge, setChallenge] = useState("hello-pow");
  const [difficulty, setDifficulty] = useState(2);
  const [N, setN] = useState(1024);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const worker = useRef<Worker | null>(null);
  const algo = algorithms.find((x) => x.id === route) || algorithms[0];
  const stop = () => {
    worker.current?.terminate();
    worker.current = null;
    setRunning(false);
  };
  useEffect(() => {
    const fn = () => {
      stop();
      setResult(null);
      setDifficulty(2);
      setRoute(location.hash.slice(1) || "home");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => {
      window.removeEventListener("hashchange", fn);
      worker.current?.terminate();
    };
  }, []);
  useEffect(() => {
    let active = true;
    setCode("");
    setCopied(false);
    fetch(
      `${import.meta.env.BASE_URL}examples/${algo.id}.${lang === "python" ? "py" : "mjs"}`,
    )
      .then((r) => {
        if (!r.ok) throw Error("代码加载失败，请刷新重试");
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
  }, [algo.id, lang]);
  function run() {
    stop();
    setError("");
    setResult(null);
    setRunning(true);
    const w = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    w.onmessage = ({ data }) => {
      if (worker.current !== w) return;
      if (data.type === "error") setError(data.message);
      else setResult(data);
      if (data.type !== "progress") stop();
    };
    w.onerror = (e) => {
      setError(e.message);
      stop();
    };
    w.postMessage({
      algorithm: algo.id as Algorithm,
      challenge,
      difficulty,
      N,
    });
  }
  const nav = (id: string) => {
    location.hash = id;
  };
  useEffect(() => {
    document.title = `${route === "home" ? "一份答案，藏着多少计算" : route === "probability" ? "概率与运气" : route === "atlas" ? "算法图谱" : (advancedById(route)?.name ?? algo.name)} · PoW Lab`;
  }, [route, algo.name]);
  return (
    <>
      <header>
        <a className="brand" href="#home">
          <span className="logo">
            P<span>•</span>
          </span>
          PoW<span className="muted">/</span>Lab
        </a>
        <nav aria-label="主导航">
          <a className={route === "home" ? "active" : ""} href="#home">
            首页
          </a>
          <a
            className={navigation.some((a) => a.id === route) ? "active" : ""}
            href="#hashcash"
          >
            算法故事
          </a>
          <a
            href="#probability"
            className={route === "probability" ? "active" : ""}
          >
            概率与运气
          </a>
          <a href="#atlas" className={route === "atlas" ? "active" : ""}>
            算法图谱
          </a>
        </nav>
        <a className="github" href="https://github.com/ider-zh/pow-lab">
          GitHub ↗
        </a>
      </header>
      {route === "home" ? (
        <>
          <main className="hero">
            <div className="eyebrow">
              <span className="dot" /> COMPUTING, EXPLAINED · VOL. 01
            </div>
            <div className="hero-grid">
              <div>
                <h1>
                  一份答案，
                  <br />
                  <span>藏着多少计算？</span>
                </h1>
                <p className="lead">
                  一张数字邮票，一本不断翻阅的厚书，一条罕见的素数链。
                  <br />
                  从这些故事里，看看计算怎样成为证据。
                </p>
                <div className="actions">
                  <button onClick={() => nav("hashcash")}>
                    从数字邮票读起 <span>↗</span>
                  </button>
                  <a href="#atlas">浏览算法图谱 →</a>
                </div>
                <div className="hero-caption">
                  关于工作量证明的十二篇交互故事
                </div>
              </div>
              <a
                className="science-cover"
                href="#hashcash"
                aria-label="读数字邮票的故事"
              >
                <div className="cover-meta">
                  <span>STORY 01 / HASHCASH</span>
                  <span>↗</span>
                </div>
                <div className="postage-sheet">
                  <span className="postage-caption">一张计算邮票</span>
                  <div className="postage-stamp">
                    <span>PROOF OF WORK</span>
                    <b>18</b>
                    <small>hello-pow:18 → 0810…</small>
                  </div>
                  <span className="postage-cancellation" aria-hidden="true">
                    19 次寻找
                    <br />1 次检查
                  </span>
                </div>
                <p>
                  为什么一个小小的数字，
                  <br />
                  能让网站相信你做过计算？
                </p>
              </a>
            </div>
            <div className="ruler">
              <span>数字邮票与哈希搜索</span>
              <span>草稿纸与内存</span>
              <span>网络里的环</span>
              <span>素数与时间</span>
            </div>
          </main>
          <section className="section">
            <div className="section-head">
              <div>
                <div className="eyebrow">STORIES ABOUT COMPUTATION</div>
                <h2>计算的故事，从这里展开。</h2>
              </div>
              <p>每一种算法，都是对计算成本的一次重新思考。</p>
            </div>
            <div className="cards">
              {algorithms.map((a) => (
                <a href={"#" + a.id} className="card" key={a.id}>
                  <span className="eyebrow">{a.tag}</span>
                  <div className="card-symbol">
                    {a.id === "hashcash"
                      ? "#"
                      : a.id === "sha256d"
                        ? "#²"
                        : "▦"}
                  </div>
                  <h3>
                    {a.name}
                    <span>↗</span>
                  </h3>
                  <p>{stories[a.id].title}</p>
                  <small>交互插画 · 故事与原理</small>
                </a>
              ))}
            </div>
          </section>
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="curriculum-callout">
              <div>
                <div className="eyebrow">TWELVE WAYS TO THINK ABOUT WORK</div>
                <h3>从哈希搜索，走进图、内存与数学。</h3>
                <p>
                  继续探索 Argon2、Equihash、Cuckoo
                  Cycle、Ethash、Etchash、RandomX、Primecoin、kHeavyHash 和
                  VDF。
                </p>
              </div>
              <a href="#atlas">进入完整算法图谱 →</a>
            </div>
          </section>
          <section className="observatory-teaser">
            <div>
              <span className="eyebrow">NEW / PROBABILITY OBSERVATORY</span>
              <h2>一次幸运，还是一种规律？</h2>
              <p>
                同一道题，有时几次就找到答案，有时却要等很久。运气背后有什么规律？
              </p>
              <a href="#probability">看看运气的形状 →</a>
            </div>
            <div className="mini-bars" aria-hidden="true">
              {[100, 78, 60, 44, 32, 22, 14, 8].map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </div>
          </section>
          <section className="manifesto">
            <div className="eyebrow">A QUESTION WORTH FOLLOWING</div>
            <h2>
              找到答案很费劲，
              <br />
              <span>检查却可以很轻松。</span>
            </h2>
            <p>怎样设计一道这样的题？故事要从一个收到了太多留言的网站说起。</p>
            <button onClick={() => nav("hashcash")}>读这个故事 ↗</button>
          </section>
        </>
      ) : route === "probability" ? (
        <ProbabilityLab />
      ) : route === "atlas" ? (
        <main className="section atlas">
          <div className="eyebrow">ALGORITHM ATLAS</div>
          <h1>计算，有许多形状。</h1>
          <p className="lead">从哈希搜索到图论与随机程序，沿着问题认识算法。</p>
          <div className="cards">
            {algorithms.map((a) => (
              <a className="card" href={"#" + a.id} key={a.id}>
                <span className="pill">计算故事</span>
                <h3>{a.name} ↗</h3>
                <p>{stories[a.id].title}</p>
              </a>
            ))}
            {advancedLessons.map((a) => (
              <a className="card" href={"#" + a.id} key={a.id}>
                <span className="pill">
                  {a.id === "vdf" ? "关于时间的番外" : "计算故事"}
                </span>
                <h3>{a.name} ↗</h3>
                <p>{stories[a.id].title}</p>
                <small>章节插画 · 可展开的实验与代码</small>
              </a>
            ))}
          </div>
          <aside>
            历史坐标：以太坊主网于 2022 年 9 月 15 日完成 The Merge，转向
            PoS。Ethash 一篇讲述历史协议，Etchash 接着介绍它的 epoch 调整。{" "}
            <a href="https://ethereum.org/roadmap/merge/">阅读原始资料 ↗</a>
          </aside>
        </main>
      ) : advancedById(route) ? (
        <AdvancedLesson
          key={route}
          lesson={advancedById(route)!}
          navigation={navigation}
        />
      ) : (
        <main className="lesson">
          <aside className="sidebar extended-sidebar">
            <div className="eyebrow">计算的十二个故事</div>
            {navigation.map((a, i) => (
              <a
                className={route === a.id ? "selected" : ""}
                key={a.id}
                href={"#" + a.id}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {a.name}
                <span>↗</span>
              </a>
            ))}
            <p>还可以读</p>
            <a href="#atlas">探索算法图谱 →</a>
            <div className="side-note">
              一个问题，
              <br />
              牵出一段计算的故事。
            </div>
          </aside>
          <div className="lesson-body">
            <ReadingStory
              key={algo.id}
              id={algo.id}
              name={algo.name}
              tag={algo.tag}
            />
            <ReadingExtras
              title="让这台设备，实际算一次"
              subtitle="可调参数 · 真实计算与检查"
              onClose={stop}
            >
              <section className="panel">
                <div className="panel-title">
                  <h2>
                    <small>02</small> 一次真实搜索
                  </h2>
                  <span className="pill">Worker · 实际计算</span>
                </div>
                <div className="experiment">
                  <div className="parameters">
                    <label>
                      挑战字符串
                      <input
                        value={challenge}
                        maxLength={120}
                        disabled={running}
                        onChange={(e) => {
                          setChallenge(e.target.value);
                          setResult(null);
                          setError("");
                        }}
                      />
                    </label>
                    <label>
                      难度 · 十六进制前导零 <b>{difficulty}</b>
                      <input
                        type="range"
                        min="1"
                        max={algo.id === "scrypt" ? 2 : 4}
                        value={difficulty}
                        disabled={running}
                        onChange={(e) => {
                          setDifficulty(+e.target.value);
                          setResult(null);
                          setError("");
                        }}
                      />
                    </label>
                    {algo.id === "scrypt" && (
                      <label>
                        N · 内存规模
                        <select
                          disabled={running}
                          value={N}
                          onChange={(e) => {
                            setN(+e.target.value);
                            setResult(null);
                            setError("");
                          }}
                        >
                          {[1024, 2048, 4096].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <div className="expected">
                      <small>理论平均尝试次数</small>
                      <strong>{(16 ** difficulty).toLocaleString()}</strong>
                      <span>每次命中概率 1 / {16 ** difficulty}</span>
                    </div>
                    <button onClick={running ? stop : run}>
                      {running ? "停止计算 ■" : "开始实验 ↗"}
                    </button>
                    <small>单次预算 15 秒 · 可随时停止</small>
                  </div>
                  <div className="terminal" aria-live="polite">
                    <div className="terminal-top">
                      <span className={running ? "dot pulse" : "dot"} />{" "}
                      {running
                        ? "SEARCHING"
                        : result?.verified
                          ? "PROOF FOUND"
                          : "READY TO EXPLORE"}
                    </div>
                    <small>NONCE</small>
                    <div className="nonce">
                      {result?.nonce.toLocaleString() ?? "—"}
                    </div>
                    <small>OUTPUT / 256 BITS</small>
                    <code className={result?.verified ? "success" : ""}>
                      {result?.hash ?? "运行实验，观察真实哈希输出。"}
                    </code>
                    <div className="metrics">
                      <div>
                        <small>尝试次数</small>
                        <b>{result?.attempts.toLocaleString() ?? "—"}</b>
                      </div>
                      <div>
                        <small>求解时间</small>
                        <b>
                          {result
                            ? `${(result.elapsed / 1000).toFixed(3)} s`
                            : "—"}
                        </b>
                      </div>
                      <div>
                        <small>吞吐率</small>
                        <b>
                          {result
                            ? `${Math.round(result.attempts / Math.max(result.elapsed / 1000, 0.001)).toLocaleString()} /s`
                            : "—"}
                        </b>
                      </div>
                      <div>
                        <small>复算验证</small>
                        <b>
                          {result?.verified
                            ? `通过 · ${result.verifyMs?.toFixed(2)} ms`
                            : "待求解"}
                        </b>
                      </div>
                    </div>
                    {result?.type === "limit" && (
                      <p>已达到尝试次数预算。可调低难度继续实验。</p>
                    )}
                    {result?.type === "timeout" && (
                      <p>已用完本次时间预算。可调低难度继续实验。</p>
                    )}
                    {result?.type === "progress" && !running && (
                      <p>
                        已停止，展示最后一次回传的累计数据。实际停止前可能还有额外尝试。
                      </p>
                    )}
                    {error && <p role="alert">{error}</p>}
                  </div>
                </div>
                {result && result.trace?.length > 0 && (
                  <TraceReplay
                    key={`${result.algorithm}:${result.challenge}:${result.difficulty}:${result.N}`}
                    result={result}
                  />
                )}{" "}
                {result?.verified && (
                  <ProofInspector
                    key={`${result.algorithm}:${result.challenge}:${result.nonce}:${result.N}`}
                    result={result}
                  />
                )}{" "}
                {algo.id === "scrypt" && (
                  <p className="footnote">
                    内存模型：128 × N × r ={" "}
                    {((128 * N * 8) / 1048576).toFixed(1)} MiB，表示 ROMix
                    主要工作区的理论估计。实际进程内存还包含运行时开销。
                  </p>
                )}
                <p className="footnote">
                  实验编码：challenge + ":" + 十进制 nonce；Scrypt 使用固定盐
                  pow-lab-v1。耗时包含本实现与运行环境开销。
                </p>
              </section>
            </ReadingExtras>
            <ReadingExtras
              title="再往里看：概率与计算配方"
              subtitle="公式 · 假设 · 原始资料"
            >
              <section className="panel">
                <h2>
                  <small>03</small> 搜索背后的数学
                </h2>
                <p className="intro">{algo.detail}</p>
                <p>
                  设 X 为首次成功所需尝试次数，d
                  为前导零字符数。将哈希输出视作均匀随机时，单次成功概率 p =
                  16⁻ᵈ。
                </p>
                <div className="math">
                  E[X] = 16ᵈ <span>Pr(X ≤ n) = 1 − (1 − 16⁻ᵈ)ⁿ</span>
                </div>
                <p>
                  平均值描述许多实验的整体表现。单次实验可能很快成功，也可能经历漫长的等待。将难度加
                  1，再观察平均成本如何增长。
                </p>
                <a className="source" href="#probability">
                  用重复实验检验概率 →
                </a>
                <br />
                <br />
                <a className="source" href={algo.source}>
                  原始论文 / 协议资料 ↗
                </a>
              </section>
            </ReadingExtras>
            <ReadingExtras
              title="这个想法，写成代码会是什么样？"
              subtitle="Python / Node.js · 可复制运行"
            >
              <section className="panel">
                <div className="panel-title">
                  <h2>
                    <small>04</small> 两种语言，同一份计算
                  </h2>
                  <div className="tabs">
                    {["python", "nodejs"].map((l) => (
                      <button
                        className={lang === l ? "tab active" : "tab"}
                        onClick={() => {
                          setLang(l);
                          setCopied(false);
                        }}
                        key={l}
                      >
                        {l === "python" ? "Python" : "Node.js"}
                      </button>
                    ))}
                    <button
                      className="tab"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(code);
                          setCopied(true);
                        } catch {
                          setCopied(false);
                          setError("复制未完成，可以在代码区选择并复制");
                        }
                      }}
                    >
                      {copied ? "已复制 ✓" : "复制"}
                    </button>
                  </div>
                </div>
                <CodeBlock code={code} language={lang} />
                <p className="footnote">
                  示例使用标准库，默认难度 2。运行：
                  {lang === "python"
                    ? `python examples/${algo.id}.py`
                    : `node examples/${algo.id}.mjs`}
                  。
                </p>
              </section>
            </ReadingExtras>
            <div className="lesson-nav">
              <a
                href={
                  algorithms.indexOf(algo) === 0
                    ? "#home"
                    : "#" + algorithms[algorithms.indexOf(algo) - 1].id
                }
              >
                ←{" "}
                {algorithms.indexOf(algo) === 0
                  ? "返回首页"
                  : algorithms[algorithms.indexOf(algo) - 1].name}
              </a>
              <a href={"#" + navigation[algorithms.indexOf(algo) + 1].id}>
                接着读 {navigation[algorithms.indexOf(algo) + 1].name} →
              </a>
            </div>
          </div>
        </main>
      )}
      <footer>
        <a className="brand" href="#home">
          PoW / Lab
        </a>
        <span>看见计算，理解证明。</span>
        <a href="https://github.com/ider-zh/pow-lab">探索源码 ↗</a>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
