import type { ScryptFilm } from "./data";
import { clamp } from "./shared";
export const scryptChapters = [
  {
    at: 0,
    title: "展开输入",
    text: "PBKDF2 将输入展开成初始状态 X。本动画实际执行小参数 Scrypt：N=16 或 32、r=1、p=1。",
  },
  {
    at: 0.12,
    title: "顺序写入",
    text: "先把 X 存入 V[i]，再经过 BlockMix 更新 X。重复 N 次，工作区逐块填满。",
  },
  {
    at: 0.43,
    title: "按数据寻址",
    text: "读取 X 末块的 64 位整数，计算 j = Integerify(X) mod N。每次访问的位置由数据决定。",
  },
  {
    at: 0.82,
    title: "异或与混合",
    text: "取出 V[j]，与当前 X 逐位异或，再执行 BlockMix。新的 X 会决定下一轮访问地址。",
  },
  {
    at: 0.94,
    title: "派生输出",
    text: "N 次访问与混合后，PBKDF2 根据最终状态派生输出。下方求解实验使用更大的 N 与 r 参数。",
  },
];
export default function ScryptScene({
  data,
  progress,
  onSize,
}: {
  data: ScryptFilm;
  progress: number;
  onSize: () => void;
}) {
  const fill = clamp((progress - 0.12) / 0.31);
  const readProgress = clamp((progress - 0.43) / 0.51);
  const reading = progress >= 0.43;
  const readIndex = Math.min(data.N - 1, Math.floor(readProgress * data.N));
  const writeIndex = Math.min(data.N - 1, Math.floor(fill * data.N));
  const current = data.reads[readIndex];
  const active = reading ? current.j : writeIndex;
  const cols = data.N === 16 ? 4 : 8;
  const rows = 4;
  const tileW = data.N === 16 ? 100 : 60;
  const tileH = data.N === 16 ? 46 : 29;
  const originX = data.N === 16 ? 260 : 200,
    originY = 42;
  const center = (i: number) => ({
    x: originX + (((i % cols) - Math.floor(i / cols)) * tileW) / 2,
    y: originY + (((i % cols) + Math.floor(i / cols)) * tileH) / 2,
  });
  const target = center(active);
  const motion = (reading ? readProgress : fill) * data.N;
  const local = Math.min(0.99, motion % 1);
  const t = reading ? 1 - local : local;
  const pulseX =
    (1 - t) ** 2 * 80 + 2 * (1 - t) * t * (target.x - 90) + t * t * target.x;
  const pulseY =
    (1 - t) ** 2 * 290 + 2 * (1 - t) * t * 280 + t * t * (target.y - 15);
  const visible = progress >= 0.12;
  return (
    <div className="memory-film">
      <div className="film-scene-eyebrow">
        <span>03 / MEMORY BECOMES THE WORK</span>
        <span>真实 ROMix 轨迹 · 小参数</span>
      </div>
      <div className="memory-input">
        <span>INPUT</span>
        <code>{data.input}</code>
        <span>SALT / pow-lab-v1</span>
      </div>
      <div className="memory-layout">
        <div className="memory-landscape">
          <div className="memory-topline">
            <div>
              <b>{data.N}</b>
              <span>内存块 × 128 字节</span>
            </div>
            <button className="film-action" onClick={onSize}>
              切换 N={data.N === 16 ? 32 : 16}
            </button>
          </div>
          <svg
            className="memory-island"
            viewBox="0 0 530 335"
            role="img"
            aria-label={`ROMix 内存工作区 ${data.N} 块，${reading ? `读取 V[${current.j}]` : `写入 V[${writeIndex}]`}，共 ${data.N * 128} 字节主要工作区`}
          >
            <defs>
              <radialGradient id="memory-floor">
                <stop stopColor="#dfaf65" stopOpacity=".13" />
                <stop offset="1" stopColor="#dfaf65" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx={265}
              cy={190}
              rx={250}
              ry={130}
              fill="url(#memory-floor)"
            />
            {Array.from({ length: rows * cols }, (_, i) => {
              const p = center(i);
              const filled = visible && (reading || i <= writeIndex);
              const selected = visible && i === active;
              const w = tileW * 0.44,
                h = tileH * 0.44;
              return (
                <g
                  key={i}
                  className={`memory-tile ${filled ? "tile-filled" : ""} ${selected ? "tile-selected" : ""}`}
                  style={{
                    transform: selected ? "translateY(-8px)" : "translateY(0)",
                  }}
                >
                  <path
                    className="tile-side"
                    d={`M${p.x - w} ${p.y}l${w} ${h}l${w} ${-h}v13l${-w} ${h}l${-w} ${-h}Z`}
                  />
                  <path
                    className="tile-top"
                    d={`M${p.x} ${p.y - h}l${w} ${h}l${-w} ${h}l${-w} ${-h}Z`}
                  />
                  <text x={p.x} y={p.y + 3} textAnchor="middle">
                    V[{i}]
                  </text>
                </g>
              );
            })}
            {visible && (
              <g>
                <path
                  d={`M80 290Q${target.x - 90} 280 ${target.x} ${target.y - 15}`}
                  className="address-path"
                />
                <circle
                  cx={pulseX}
                  cy={pulseY}
                  r={4.5}
                  fill="#ffe5b9"
                  className="memory-data-pulse"
                />
                <circle cx={target.x} cy={target.y - 15} r={4} fill="#efc080" />
              </g>
            )}
            <rect
              x={22}
              y={267}
              width={115}
              height={43}
              rx={7}
              className="memory-cpu"
            />
            <text
              x={80}
              y={285}
              textAnchor="middle"
              className="memory-cpu-title"
            >
              {reading ? "READ + XOR" : "WRITE"}
            </text>
            <text
              x={80}
              y={300}
              textAnchor="middle"
              className="memory-cpu-small"
            >
              {reading ? `j = ${current.j}` : `i = ${writeIndex}`}
            </text>
          </svg>
          <div className="memory-progress">
            <span>
              写入 {progress < 0.12 ? 0 : reading ? data.N : writeIndex + 1}/
              {data.N}
            </span>
            <div>
              <i style={{ width: `${fill * 100}%` }} />
            </div>
            <span>
              读取 {reading ? readIndex + 1 : 0}/{data.N}
            </span>
          </div>
        </div>
        <div className="memory-register">
          <span className="instrument-label">LIVE REGISTER / 实际中间值</span>
          <div className="address-calculation">
            <small>Integerify(X) mod {data.N}</small>
            <code>{reading ? current.integer : "等待寻址"}</code>
            <b>
              j = <span>{reading ? current.j : "—"}</span>
            </b>
          </div>
          <div className="xor-stack">
            <div>
              <small>当前 X · 前 4 字节</small>
              <code>
                {reading
                  ? current.before.slice(0, 8)
                  : data.initial.slice(0, 8)}
              </code>
            </div>
            <span>⊕</span>
            <div>
              <small>V[j] · 前 4 字节</small>
              <code>{reading ? current.stored.slice(0, 8) : "········"}</code>
            </div>
            <span>↓ XOR</span>
            <div>
              <small>X ⊕ V[j] · 前 4 字节</small>
              <code>{reading ? current.xored.slice(0, 8) : "········"}</code>
            </div>
            <span>↓ BlockMix (Salsa20/8)</span>
            <div className="mixed-register">
              <small>更新后的 X · 前 4 字节</small>
              <code>{reading ? current.after.slice(0, 8) : "········"}</code>
            </div>
          </div>
          <div className="memory-capacity">
            <b>{((128 * data.N) / 1024).toFixed(0)} KiB</b>
            <small>
              ROMix 主工作区理论大小
              <br />
              128 × N × r
            </small>
          </div>
        </div>
      </div>
      <div className="derived-key">
        <span>DERIVED OUTPUT / 32 BYTES</span>
        <code>
          {progress >= 0.94 ? data.output : "完成内存混合后，派生最终输出。"}
        </code>
        <small>N={data.N} · r=1 · p=1 · 教学参数</small>
      </div>
    </div>
  );
}
