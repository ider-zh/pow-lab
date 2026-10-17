import type { Lesson } from "./catalog";
export default function AdvancedDiagram({
  lesson,
  progress,
}: {
  lesson: Lesson;
  progress: number;
}) {
  const work = Math.max(0, Math.min(1, (progress - 0.15) / 0.4));
  const phase = [0, 0.15, 0.55, 0.72, 0.88].reduce(
    (s, n, i) => (progress >= n ? i : s),
    0,
  );
  const active = Math.floor(work * 24) % 24;
  const id = lesson.id;
  const nodes = Array.from({ length: 8 }, (_, i) => ({
    x: 340 + Math.cos((i * Math.PI) / 4) * 105,
    y: 145 + Math.sin((i * Math.PI) / 4) * 105,
  }));
  const memory = ["ethash", "argon2"].includes(id);
  return (
    <svg
      viewBox="0 0 680 300"
      role="img"
      aria-label={`${lesson.name} 全局原理动画，当前阶段：${lesson.chapters[phase][0]}`}
    >
      <defs>
        <radialGradient id={`advanced-glow-${id}`}>
          <stop stopColor="var(--film-accent)" stopOpacity=".12" />
          <stop offset="1" stopColor="var(--film-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={340}
        cy={150}
        rx={290}
        ry={145}
        fill={`url(#advanced-glow-${id})`}
      />
      {id === "equihash" && (
        <g>
          {Array.from({ length: 16 }, (_, i) => (
            <g key={i} opacity={work > i / 20 ? 1 : 0.22}>
              <rect
                x={32 + i * 39}
                y={34}
                width={25}
                height={28}
                rx={4}
                fill={i % 2 ? "#a9c7ff55" : "#c7ef8655"}
              />
              <path
                d={`M${44 + i * 39} 67L${64 + Math.floor(i / 2) * 78} 125`}
                className="advanced-wire"
              />
            </g>
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} opacity={work > 0.25 ? 1 : 0.2}>
              <rect
                x={48 + i * 78}
                y={125}
                width={34}
                height={25}
                rx={4}
                className="advanced-block"
              />
              <path
                d={`M${65 + i * 78} 151L${104 + Math.floor(i / 2) * 156} 205`}
                className="advanced-wire"
              />
            </g>
          ))}
          {Array.from({ length: 4 }, (_, i) => (
            <g key={i} opacity={work > 0.55 ? 1 : 0.2}>
              <circle
                cx={104 + i * 156}
                cy={210}
                r={17}
                className="advanced-block"
              />
              <path
                d={`M${104 + i * 156} 230L340 267`}
                className="advanced-wire"
              />
            </g>
          ))}
          <text x={340} y={289} textAnchor="middle" className="advanced-large">
            {phase >= 2 ? "⊕ = 0 · 索引证明" : "按前缀分组，再逐层合并"}
          </text>
        </g>
      )}
      {id === "cuckoo" && (
        <g>
          {nodes.map((a, i) => (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={nodes[(i + 1) % 8].x}
                y2={nodes[(i + 1) % 8].y}
                className={
                  work > i / 10 ? "advanced-edge-found" : "advanced-wire"
                }
              />
              <line
                x1={a.x}
                y1={a.y}
                x2={a.x * 1.3 - 100}
                y2={a.y * 1.3 - 45}
                className="advanced-wire"
                opacity={1 - work * 0.9}
              />
              <circle
                cx={a.x}
                cy={a.y}
                r={13}
                className={
                  work > i / 10 ? "advanced-node-found" : "advanced-block"
                }
              />
            </g>
          ))}
          <text x={340} y={145} textAnchor="middle" className="advanced-large">
            {phase >= 2 ? "一个闭合环" : "全图搜索"}
          </text>
          <text x={340} y={173} textAnchor="middle">
            提交少量边，重建并检查
          </text>
        </g>
      )}
      {id === "randomx" && (
        <g>
          {["ADD", "MUL", "LOAD", "STORE"].map((op, i) => (
            <g key={op}>
              <rect
                x={40}
                y={45 + i * 48}
                width={110}
                height={34}
                rx={5}
                className={
                  Math.floor(work * 15) % 4 === i
                    ? "advanced-node-found"
                    : "advanced-block"
                }
              />
              <text
                x={95}
                y={68 + i * 48}
                textAnchor="middle"
                className="opcode-text"
              >
                {op}
              </text>
            </g>
          ))}
          <path
            d="M230 90L310 42L390 90V202L310 250L230 202Z"
            className="advanced-block"
          />
          <text x={310} y={135} textAnchor="middle" className="advanced-large">
            CPU / VM
          </text>
          <text x={310} y={167} textAnchor="middle">
            寄存器 · 运算 · 访存
          </text>
          {Array.from({ length: 24 }, (_, i) => (
            <rect
              key={i}
              x={467 + (i % 6) * 27}
              y={71 + Math.floor(i / 6) * 38}
              width={20}
              height={24}
              rx={3}
              className={
                work > i / 30 ? "advanced-cell-filled" : "advanced-block"
              }
            />
          ))}
          <path
            d="M150 134H230M390 134H465M465 170Q440 240 390 193"
            className="advanced-edge-found"
          />
          <circle
            cx={150 + work * 80}
            cy={134}
            r={5}
            className="advanced-node-found"
          />
          <text x={340} y={288} textAnchor="middle" className="advanced-large">
            随机程序 → CPU ↔ 内存
          </text>
        </g>
      )}
      {memory && (
        <g>
          {Array.from({ length: 48 }, (_, i) => (
            <rect
              key={i}
              x={145 + (i % 12) * 33}
              y={45 + Math.floor(i / 12) * 42}
              width={25}
              height={27}
              rx={3}
              className={
                work > (i / 48) * 0.7
                  ? "advanced-cell-filled"
                  : "advanced-block"
              }
              opacity={id === "randomx" && i === active ? 1 : 0.75}
            />
          ))}
          {id === "argon2" ? (
            <g>
              <path
                d={`M132 69H550M132 111H550M132 153H550M132 195H550`}
                className="advanced-wire"
                strokeDasharray="5 5"
              />
              <text
                x={340}
                y={255}
                textAnchor="middle"
                className="advanced-large"
              >
                多通道 × 多轮遍历
              </text>
              <circle
                cx={145 + work * 390}
                cy={28}
                r={6}
                className="advanced-node-found"
              />
            </g>
          ) : (
            <g>
              <path
                d={`M68 240Q${170 + (active % 12) * 33} 225 ${157 + (active % 12) * 33} ${58 + Math.floor(active / 12) * 42}`}
                className="advanced-edge-found"
              />
              <rect
                x={32}
                y={220}
                width={100}
                height={38}
                rx={5}
                className="advanced-block"
              />
              <text x={82} y={245} textAnchor="middle">
                混合状态
              </text>
              <text
                x={410}
                y={257}
                textAnchor="middle"
                className="advanced-large"
              >
                按状态选择下一项
              </text>
            </g>
          )}
        </g>
      )}
      {id === "etchash" && (
        <g>
          {[30000, 60000].map((n, row) => (
            <g key={n}>
              <text x={40} y={73 + row * 125} className="advanced-large">
                {n} 区块 / epoch
              </text>
              <path
                d={`M40 ${105 + row * 125}H630`}
                className="advanced-wire"
              />
              {Array.from({ length: row === 0 ? 12 : 6 }, (_, i) => (
                <g key={i}>
                  <line
                    x1={55 + i * (row === 0 ? 48 : 96)}
                    x2={55 + i * (row === 0 ? 48 : 96)}
                    y1={90 + row * 125}
                    y2={118 + row * 125}
                    className="advanced-edge-found"
                  />
                  <rect
                    x={55 + i * (row === 0 ? 48 : 96)}
                    y={112 + row * 125}
                    width={row === 0 ? 35 : 70}
                    height={10 + (i + 1) * work * 3}
                    fill="var(--film-accent)"
                    opacity={0.2 + i * 0.05}
                  />
                </g>
              ))}
            </g>
          ))}
        </g>
      )}
      {id === "primecoin" && (
        <g>
          {[2, 5, 11, 23, 47].map((n, i) => (
            <g key={n} opacity={work > i / 6 ? 1 : 0.2}>
              {i > 0 && (
                <g>
                  <path
                    d={`M${108 + (i - 1) * 120} 137H${42 + i * 120}`}
                    className="advanced-wire"
                  />
                  <text x={135 + (i - 1) * 120} y={115} textAnchor="middle">
                    ×2 + 1
                  </text>
                </g>
              )}
              <circle
                cx={75 + i * 120}
                cy={140}
                r={34}
                className={
                  work > i / 6 ? "advanced-node-found" : "advanced-block"
                }
              />
              <text
                x={75 + i * 120}
                y={147}
                textAnchor="middle"
                className="chain-number"
              >
                {n}
              </text>
            </g>
          ))}
          <text x={340} y={235} textAnchor="middle" className="advanced-large">
            {phase >= 2 ? "一条可检查的素数链" : "每一步都保持素数性质"}
          </text>
        </g>
      )}
      {id === "kheavyhash" && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect
                x={70}
                y={55 + i * 45}
                width={38}
                height={31}
                rx={4}
                className="advanced-block"
              />
              <rect
                x={540}
                y={55 + i * 45}
                width={38}
                height={31}
                rx={4}
                className={
                  work > i / 5 ? "advanced-node-found" : "advanced-block"
                }
              />
            </g>
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <rect
              key={i}
              x={230 + (i % 4) * 45}
              y={45 + Math.floor(i / 4) * 45}
              width={35}
              height={35}
              rx={3}
              className={
                phase >= 2 || Math.floor(i / 4) === Math.floor(work * 4) % 4
                  ? "advanced-node-found"
                  : "advanced-block"
              }
            />
          ))}
          <text x={160} y={142} textAnchor="middle" className="advanced-large">
            ×
          </text>
          <text x={475} y={142} textAnchor="middle" className="advanced-large">
            →
          </text>
          <text x={340} y={265} textAnchor="middle" className="advanced-large">
            向量 → 矩阵变换 → 混合与哈希
          </text>
        </g>
      )}
      {id === "vdf" && (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i} opacity={work > i / 13 ? 1 : 0.2}>
              {i > 0 && (
                <path
                  d={`M${57 + (i - 1) * 50} 110H${25 + i * 50}`}
                  className="advanced-wire"
                />
              )}
              <rect
                x={25 + i * 50}
                y={91}
                width={31}
                height={38}
                rx={5}
                className={
                  work > i / 13 ? "advanced-node-found" : "advanced-block"
                }
              />
              <text
                x={41 + i * 50}
                y={115}
                textAnchor="middle"
                className="chain-number small-chain"
              >
                ²
              </text>
            </g>
          ))}
          <path d="M40 173H626" className="advanced-wire" />
          <text x={340} y={213} textAnchor="middle" className="advanced-large">
            前一步的结果，成为下一步输入
          </text>
          <text x={340} y={259} textAnchor="middle">
            {phase >= 2
              ? "结果 y + 证明 π → 验证等式"
              : "沿着同一条计算依赖链推进"}
          </text>
        </g>
      )}
    </svg>
  );
}
