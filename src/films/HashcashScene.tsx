import type { HashcashFilm } from "./data";
import { clamp, Rotor } from "./shared";
export const hashcashChapters = [
  {
    at: 0,
    title: "设定目标",
    text: "找到首个十六进制字符为 0 的哈希。样例挑战固定，所有候选都经过真实 SHA-256 计算。",
  },
  {
    at: 0.13,
    title: "遍历 nonce",
    text: "nonce 是反复尝试的数字。输入每改变一次，得到一张全新的“彩票”。动画放慢计算，让每个候选清晰可见。",
  },
  {
    at: 0.79,
    title: "找到证明",
    text: "命中来自实际计算。绿色前缀满足目标，nonce 与挑战一起构成本次证明。",
  },
  {
    at: 0.91,
    title: "一次复算",
    text: "把命中的 nonce 交给验证者。只需重新计算这一个输入，即可检查前导零条件。",
  },
];
export default function HashcashScene({
  data,
  progress,
}: {
  data: HashcashFilm;
  progress: number;
}) {
  const trialProgress = clamp((progress - 0.13) / 0.66);
  const i = Math.min(
    data.attempts.length - 1,
    Math.floor(trialProgress * data.attempts.length),
  );
  const current = data.attempts[i];
  const found = progress >= 0.79 && current.hit;
  const verified =
    progress >= 0.91 && found && data.verifiedHash === current.hash;
  return (
    <div className="search-film">
      <div className="film-scene-eyebrow">
        <span>01 / THE NONCE SEARCH</span>
        <span>真实样例 · SHA-256</span>
      </div>
      <div className="search-architecture">
        <div className="nonce-instrument">
          <span className="instrument-label">CHALLENGE</span>
          <code>{data.challenge}</code>
          <div className="nonce-dial">
            <small>NONCE</small>
            <strong key={i}>
              {progress < 0.13
                ? "0"
                : current.nonce.toString().padStart(2, "0")}
            </strong>
            <span>{found ? "答案已找到" : "改变一个数，再尝试"}</span>
          </div>
          <div className="instrument-rule">
            <i />
            <span>UTF-8 编码输入</span>
          </div>
        </div>
        <div className="search-reactor">
          <Rotor
            progress={trialProgress * 6 + clamp((progress - 0.91) / 0.09)}
            label="256 / HASH"
          />
          <div className="signal-caption">
            {progress < 0.13
              ? "等待输入"
              : verified
                ? "验证者复算"
                : found
                  ? "目标已命中"
                  : "计算每一个候选"}
          </div>
        </div>
        <div className={`target-instrument ${found ? "target-found" : ""}`}>
          <div className="target-header">
            <span>TARGET / 前导零</span>
            <b>0···</b>
          </div>
          <div
            className="hex-field"
            role="img"
            aria-label={`当前哈希 ${current.hash}`}
          >
            {current.hash.split("").map((c, j) => (
              <span
                key={j}
                className={j === 0 ? "target-prefix" : ""}
                style={{ opacity: progress < 0.13 ? 0.2 : 1 }}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="target-footer">
            <span className={found ? "status-found" : "status-searching"}>
              {verified
                ? "✓ 证明验证通过"
                : found
                  ? "✓ 满足目标条件"
                  : "比较首个字符"}
            </span>
            <span>{progress < 0.13 ? "—" : i + 1} 次尝试</span>
          </div>
        </div>
      </div>
      <div className="candidate-conveyor">
        <div className="conveyor-label">
          <span>SEARCH HISTORY</span>
          <small>真实候选 · 按 nonce 顺序</small>
        </div>
        <div className="candidate-window">
          {Array.from({ length: 3 }, (_, offset) => {
            const index = Math.max(0, i - 2) + offset;
            if (index > i || index >= data.attempts.length)
              return (
                <div className="candidate-row empty" key={offset}>
                  等待下一次尝试
                </div>
              );
            const a = data.attempts[index];
            return (
              <div
                className={`candidate-row ${index === i ? "current-candidate" : ""} ${a.hit && found ? "hit-candidate" : ""}`}
                key={offset}
              >
                <span>#{a.nonce.toString().padStart(2, "0")}</span>
                <code>
                  <b>{a.hash[0]}</b>
                  {a.hash.slice(1, 23)}
                  <span>…</span>
                </code>
                <small>{a.hit ? "命中" : "继续搜索"}</small>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`proof-receipt ${verified ? "receipt-stamped" : ""}`}>
        <span>{verified ? "✓ VERIFIED" : "PROOF OF WORK"}</span>
        <code>
          {data.challenge} : {found ? current.nonce : "?"}
        </code>
        <small>
          {verified ? "一次哈希即可检查" : "搜索得到 nonce，再交给验证者"}
        </small>
      </div>
    </div>
  );
}
