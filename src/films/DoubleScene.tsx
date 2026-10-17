import type { DoubleFilm } from "./data";
import { ByteGrid, clamp, Rotor } from "./shared";
export const doubleChapters = [
  {
    at: 0,
    title: "准备字节",
    text: "文本先编码为 UTF-8。这里改变 nonce 的一个字符，观察两个阶段的输出如何变化。",
  },
  {
    at: 0.16,
    title: "第一次哈希",
    text: "输入通过 SHA-256，得到 32 字节的中间结果。格子里的每两个十六进制字符表示一个字节。",
  },
  {
    at: 0.43,
    title: "传递 32 字节",
    text: "第二次哈希接收的是中间结果的原始 32 字节。十六进制只是屏幕上的显示方式。",
  },
  {
    at: 0.64,
    title: "第二次哈希",
    text: "同样的 SHA-256 再执行一次，得到最终 256 位输出。两个计算阶段各有独立的输入与结果。",
  },
  {
    at: 0.88,
    title: "观察雪崩效应",
    text: "切换 nonce 0 / 1，观察两个输出有多少位发生变化。浅蓝格子标出与 nonce 0 相比发生变化的字节。",
  },
];
export default function DoubleScene({
  data,
  progress,
  variant,
  onVariant,
}: {
  data: DoubleFilm;
  progress: number;
  variant: boolean;
  onVariant: () => void;
}) {
  const sample = variant ? data.changed : data.original;
  const firstReveal = clamp((progress - 0.16) / 0.24);
  const secondReveal = clamp((progress - 0.64) / 0.23);
  return (
    <div className="double-film">
      <div className="film-scene-eyebrow">
        <span>02 / A TWO-PASS TRANSFORMATION</span>
        <span>真实字节 · 双重 SHA-256</span>
      </div>
      <div className="double-input">
        <div>
          <span className="instrument-label">UTF-8 INPUT</span>
          <code>{sample.input}</code>
        </div>
        <button
          className="film-action"
          aria-pressed={variant}
          onClick={onVariant}
        >
          切换 nonce <b>{variant ? "1 → 0" : "0 → 1"}</b>
        </button>
      </div>
      <div className="twin-reactors">
        <article className={progress >= 0.16 ? "reactor-active" : ""}>
          <div className="reactor-title">
            <span>PASS 01</span>
            <small>H₁ = SHA256(input)</small>
          </div>
          <Rotor
            progress={clamp((progress - 0.16) / 0.27) * 3}
            label="FIRST PASS"
          />
          <ByteGrid
            value={sample.first}
            reveal={firstReveal}
            compare={variant ? data.original.first : undefined}
            label={`第一次哈希 ${sample.first}`}
          />
          <div className="reactor-caption">中间结果 · 32 bytes</div>
        </article>
        <div className="byte-bridge">
          <div className="bridge-title">
            RAW
            <br />
            <b>32</b>
            <br />
            BYTES
          </div>
          <div className="bridge-wire">
            <span
              style={{ left: `${clamp((progress - 0.43) / 0.21) * 100}%` }}
            />
          </div>
          <div className="bridge-preview">
            {sample.first.slice(0, 2)} <span>{sample.first.slice(2, 4)}</span>{" "}
            {sample.first.slice(4, 6)}
          </div>
        </div>
        <article className={progress >= 0.64 ? "reactor-active" : ""}>
          <div className="reactor-title">
            <span>PASS 02</span>
            <small>H₂ = SHA256(bytes(H₁))</small>
          </div>
          <Rotor
            progress={clamp((progress - 0.64) / 0.24) * 3}
            label="SECOND PASS"
            second
          />
          <ByteGrid
            value={sample.second}
            reveal={secondReveal}
            compare={variant ? data.original.second : undefined}
            label={`第二次哈希 ${sample.second}`}
          />
          <div className="reactor-caption">最终输出 · 256 bits</div>
        </article>
      </div>
      <div className="avalanche-meter">
        <div>
          <span>一个字符改变</span>
          <code>nonce 0 → 1</code>
        </div>
        <div>
          <small>第一次输出的位变化</small>
          <b>
            {progress >= 0.88 ? data.firstFlips : "—"} <span>/ 256 bits</span>
          </b>
          <div className="bit-track">
            <i
              style={{
                width:
                  progress >= 0.88 ? `${(data.firstFlips / 256) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
        <div>
          <small>第二次输出的位变化</small>
          <b>
            {progress >= 0.88 ? data.secondFlips : "—"} <span>/ 256 bits</span>
          </b>
          <div className="bit-track">
            <i
              style={{
                width:
                  progress >= 0.88
                    ? `${(data.secondFlips / 256) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
