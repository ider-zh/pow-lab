import { useEffect, useRef, useState } from "react";
import type { Algorithm } from "../engine";
import type { FilmData } from "./data";
import HashcashScene, { hashcashChapters } from "./HashcashScene";
import DoubleScene, { doubleChapters } from "./DoubleScene";
import ScryptScene, { scryptChapters } from "./ScryptScene";
import { useFilmClock } from "./useFilmClock";
import "./films.css";
const names = {
  hashcash: "在搜索中，找到证明。",
  sha256d: "让同一份数据，经过两次变换。",
  scrypt: "计算沿着记忆，寻找下一步。",
};
export default function FilmPlayer({ algorithm }: { algorithm: Algorithm }) {
  const [data, setData] = useState<FilmData | null>(null);
  const [N, setN] = useState(16);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");
  const [variant, setVariant] = useState(false);
  const worker = useRef<Worker | null>(null);
  const duration =
    algorithm === "scrypt" ? 26 : algorithm === "sha256d" ? 22 : 20;
  const clock = useFilmClock(data !== null, duration);
  const chapters =
    algorithm === "hashcash"
      ? hashcashChapters
      : algorithm === "sha256d"
        ? doubleChapters
        : scryptChapters;
  const chapterIndex = chapters.reduce(
    (current, ch, i) => (clock.progress >= ch.at ? i : current),
    0,
  );
  const chapter = chapters[chapterIndex];
  useEffect(() => {
    setData(null);
    setError("");
    clock.pause();
    clock.seek(0);
    const w = new Worker(new URL("../worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    const timer = setTimeout(() => {
      setError("动画数据准备超时，请重新载入");
      w.terminate();
    }, 10000);
    w.onmessage = ({ data: message }) => {
      if (worker.current !== w) return;
      clearTimeout(timer);
      if (message.type === "film") setData(message.film);
      else setError(message.message ?? "动画数据加载失败");
      w.terminate();
      worker.current = null;
    };
    w.onerror = (e) => {
      clearTimeout(timer);
      setError(e.message);
      w.terminate();
      worker.current = null;
    };
    w.postMessage({ mode: "film", algorithm, N });
    return () => {
      clearTimeout(timer);
      w.terminate();
      worker.current = null;
    };
    // A new parameter set owns a new trace and resets the playback position.
  }, [algorithm, N, retry]);
  function move(direction: number) {
    clock.pause();
    const target =
      direction > 0
        ? (chapters.find((ch) => ch.at > clock.progress + 0.001)?.at ?? 1)
        : ([...chapters].reverse().find((ch) => ch.at < clock.progress - 0.001)
            ?.at ?? 0);
    clock.seek(target * duration);
  }
  return (
    <div
      className={`principle-film film-${algorithm}`}
      data-playing={clock.playing}
    >
      <div className="film-heading">
        <div>
          <span className="film-kicker">ANATOMY OF WORK / 交互原理影片</span>
          <h3>{names[algorithm]}</h3>
        </div>
        <span className="film-data-label">
          <i />
          真实计算驱动画面
        </span>
      </div>
      {error ? (
        <div className="film-loading" role="alert">
          <p>{error}</p>
          <button className="secondary" onClick={() => setRetry((n) => n + 1)}>
            重新载入动画
          </button>
        </div>
      ) : !data ? (
        <div className="film-loading" role="status">
          <span className="loading-orbit" />
          正在构建算法轨迹…
        </div>
      ) : (
        <>
          {data.kind === "hashcash" ? (
            <HashcashScene data={data} progress={clock.progress} />
          ) : data.kind === "sha256d" ? (
            <DoubleScene
              data={data}
              progress={clock.progress}
              variant={variant}
              onVariant={() => {
                setVariant((v) => !v);
                clock.seek(duration * 0.92);
                clock.pause();
              }}
            />
          ) : (
            <ScryptScene
              data={data}
              progress={clock.progress}
              onSize={() => setN((n) => (n === 16 ? 32 : 16))}
            />
          )}
          <div className="film-chapters" aria-label="动画章节">
            {chapters.map((ch, i) => (
              <button
                key={ch.title}
                className={i === chapterIndex ? "chapter-current" : ""}
                aria-current={i === chapterIndex ? "step" : undefined}
                onClick={() => {
                  clock.pause();
                  clock.seek(ch.at * duration);
                }}
              >
                <span>0{i + 1}</span>
                {ch.title}
              </button>
            ))}
          </div>
          <div className="film-narration" aria-live="polite">
            <span className="narration-index">0{chapterIndex + 1}</span>
            <div>
              <h4>{chapter.title}</h4>
              <p>{chapter.text}</p>
            </div>
          </div>
          <div className="film-playback">
            <button
              className="film-play"
              onClick={clock.toggle}
              aria-label={
                clock.playing
                  ? "暂停原理动画"
                  : clock.progress >= 1
                    ? "重播原理动画"
                    : "播放原理动画"
              }
            >
              {clock.playing ? "Ⅱ" : clock.progress >= 1 ? "↺" : "▶"}
            </button>
            <button
              className="film-step"
              onClick={() => move(-1)}
              aria-label="动画上一步"
            >
              ←
            </button>
            <button
              className="film-step"
              onClick={() => move(1)}
              aria-label="动画下一步"
            >
              →
            </button>
            <label className="film-scrubber">
              <span className="sr-only">动画时间轴</span>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.01}
                value={clock.time}
                onChange={(e) => {
                  clock.pause();
                  clock.seek(+e.target.value);
                }}
              />
            </label>
            <span className="film-time">
              {clock.time.toFixed(1)} / {duration}s
            </span>
            <select
              aria-label="原理动画播放速度"
              value={clock.speed}
              onChange={(e) => clock.setSpeed(+e.target.value)}
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={1.5}>1.5×</option>
            </select>
            <button
              className="film-step film-reset"
              onClick={() => {
                clock.pause();
                clock.seek(0);
              }}
            >
              重置
            </button>
          </div>
        </>
      )}
      <details className="film-method">
        <summary>画面与计算如何对应？</summary>
        <p>
          {algorithm === "hashcash"
            ? '样例逐次计算 SHA256(UTF8("hello-pow:" + nonce))，前导零难度为 1，直到首次命中。影片把完整尝试记录放慢回放；影片时间表示播放进度。'
            : algorithm === "sha256d"
              ? "两组样例分别为 hello-pow:0 和 hello-pow:1。第一轮输出的原始 32 字节直接进入第二轮 SHA-256。位变化计数来自两个真实输出的逐位异或；格子按显示顺序揭示结果。"
              : "教学轨迹执行 RFC 7914 的 Scrypt，输入 hello-pow:0、盐 pow-lab-v1、N=16 或 32、r=1、p=1。每个 V[i] 为真实的 128 字节状态，每次 j 来自当前 X 的 Integerify。画面展示部分字节与工作区理论大小。下方求解使用独立参数，影片播放时间与算法耗时分别记录。"}
        </p>
        {algorithm === "scrypt" && (
          <a href="https://www.rfc-editor.org/rfc/rfc7914.html#section-5">
            查看 ROMix 定义 ↗
          </a>
        )}
      </details>
    </div>
  );
}
