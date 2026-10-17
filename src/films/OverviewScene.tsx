import type { Algorithm } from "../engine";
import { overviewState } from "./overview";
export default function OverviewScene({
  algorithm,
  progress,
}: {
  algorithm: Algorithm;
  progress: number;
}) {
  const state = overviewState(algorithm, progress);
  const isHash = algorithm === "hashcash",
    isDouble = algorithm === "sha256d";
  const workCount = Math.floor(state.work * 35);
  return (
    <div className={`overview-scene overview-${algorithm}`}>
      <div className="overview-big-idea">
        <span>
          {isHash
            ? "寻找费力，检查轻巧"
            : isDouble
              ? "每次尝试，都经过两次哈希"
              : "让内存成为每次尝试的一部分"}
        </span>
        <small>概念示意 · 固定节奏压缩展示</small>
      </div>
      <div className="global-map">
        <div
          className={`global-endpoint origin-endpoint ${state.phase === 0 ? "endpoint-active" : ""}`}
        >
          <span className="endpoint-icon" aria-hidden="true">
            {isHash ? "↗" : "◇"}
          </span>
          <strong>{isHash ? "网站发题" : "输入与目标"}</strong>
          <small>{isHash ? "挑战随请求出发" : "准备候选数据"}</small>
        </div>
        <div className="global-wire wire-in">
          <i style={{ left: `${Math.min(1, progress / 0.15) * 100}%` }} />
          <span>挑战</span>
        </div>
        <div
          className={`global-workstation ${state.phase === 1 ? "workstation-active" : ""} ${state.phase >= 2 ? "workstation-finished" : ""}`}
        >
          <div className="workstation-title">
            <span>
              {isHash
                ? "浏览器搜索"
                : isDouble
                  ? "双重哈希搜索"
                  : "计算 + 内存"}
            </span>
            <b>
              {state.phase >= 2
                ? "✓ 已获得输出"
                : state.phase === 1
                  ? "正在进行工作"
                  : "等待输入"}
            </b>
          </div>
          {isHash ? (
            <div
              className="attempt-sky"
              aria-label="许多候选被尝试，一个候选满足目标"
            >
              {Array.from({ length: 36 }, (_, i) => (
                <span
                  key={i}
                  className={`${i <= workCount && state.phase >= 1 ? "attempt-spent" : ""} ${i === 35 && state.phase >= 2 ? "attempt-winner" : ""}`}
                >
                  {i === 35 && state.phase >= 2
                    ? "✓"
                    : i <= workCount && state.phase >= 1
                      ? "·"
                      : ""}
                </span>
              ))}
              <div className="sky-label">
                {state.phase >= 2 ? "一个合格答案" : "许多次尝试"}
              </div>
            </div>
          ) : isDouble ? (
            <div className="double-overview-process">
              <div className="candidate-swarm">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={state.work > i / 6 ? "candidate-entered" : ""}
                  />
                ))}
              </div>
              <div
                className={`macro-hash ${state.phase >= 1 ? "macro-active" : ""}`}
              >
                <b>H₁</b>
                <span>第 1 次哈希</span>
              </div>
              <span className="macro-arrow">→</span>
              <div
                className={`macro-hash ${state.work > 0.35 ? "macro-active" : ""}`}
              >
                <b>H₂</b>
                <span>第 2 次哈希</span>
              </div>
              <span className="macro-arrow">→</span>
              <div
                className={`macro-target ${state.phase >= 2 ? "macro-active" : ""}`}
              >
                {state.phase >= 2 ? "✓" : "◎"}
                <span>目标筛选</span>
              </div>
            </div>
          ) : (
            <div className="macro-memory">
              <div className="macro-memory-grid">
                {Array.from({ length: 24 }, (_, i) => (
                  <span
                    key={i}
                    className={`${state.work * 2 > i / 24 ? "macro-filled" : ""} ${state.work > 0.5 && i === Math.floor(state.work * 72) % 24 ? "macro-accessed" : ""}`}
                  />
                ))}
              </div>
              <div className="memory-cycle">
                <b style={{ transform: `rotate(${state.work * 720}deg)` }}>⟳</b>
                <span>{state.work < 0.5 ? "写入中间状态" : "读回并混合"}</span>
              </div>
            </div>
          )}
          <div className="workstation-cost">
            <span>
              {isHash
                ? "工作：多次哈希"
                : isDouble
                  ? "每个候选：2 次哈希"
                  : "每次尝试：计算 + 工作内存"}
            </span>
            <i style={{ width: `${state.work * 100}%` }} />
          </div>
        </div>
        <div
          className={`global-wire wire-out ${state.phase >= 2 ? "wire-ready" : ""}`}
        >
          <i style={{ left: `${state.transfer * 100}%` }} />
          <span>{state.phase >= 2 ? "提交答案" : "证明"}</span>
        </div>
        <div
          className={`global-endpoint check-endpoint ${state.phase === 3 ? "endpoint-active" : ""} ${state.complete ? "endpoint-approved" : ""}`}
        >
          <span className="endpoint-icon" aria-hidden="true">
            {state.complete ? "✓" : "⌕"}
          </span>
          <strong>{state.complete ? "验证通过" : "检查者验证"}</strong>
          <small>
            {isHash
              ? "重算 1 次哈希"
              : isDouble
                ? "重算 2 次哈希"
                : "执行 1 次 Scrypt"}
          </small>
          <div className="check-progress">
            <i style={{ width: `${state.verification * 100}%` }} />
          </div>
        </div>
      </div>
      <div
        className={`global-result ${state.complete ? "result-revealed" : ""}`}
        role="status"
      >
        <span>{state.complete ? "✓" : "→"}</span>
        <div>
          <b>
            {state.complete
              ? isHash
                ? "证明通过，请求继续"
                : "候选通过检查，工作可验证"
              : "先完成工作，再交出可检查的答案"}
          </b>
          <p>
            {isHash
              ? "浏览器承担多次搜索，网站只检查提交的那一次。"
              : isDouble
                ? "搜索与验证使用同一个双重哈希规则。"
                : "一次派生的计算与内存成本，同时存在于求解和验证中。"}
          </p>
        </div>
      </div>
      <div className="global-takeaways">
        <div>
          <small>工作发生在哪里</small>
          <b>
            {isHash ? "候选搜索" : isDouble ? "两轮连续哈希" : "内存写入与读回"}
          </b>
        </div>
        <div>
          <small>答案如何检查</small>
          <b>
            {isHash ? "一次复算" : isDouble ? "重复两轮计算" : "重做一次派生"}
          </b>
        </div>
        <div>
          <small>这里压缩了什么</small>
          <b>实际工作的时间</b>
        </div>
      </div>
    </div>
  );
}
