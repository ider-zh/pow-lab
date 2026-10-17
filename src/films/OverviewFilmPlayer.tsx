import type { Algorithm } from "../engine";
import OverviewScene from "./OverviewScene";
import { OVERVIEW_DURATION, overviewChapters, overviewState } from "./overview";
import { useFilmClock } from "./useFilmClock";
export default function OverviewFilmPlayer({
  algorithm,
}: {
  algorithm: Algorithm;
}) {
  const clock = useFilmClock(true, OVERVIEW_DURATION);
  const state = overviewState(algorithm, clock.progress);
  const chapters = overviewChapters[algorithm];
  const chapter = chapters[state.phase];
  return (
    <div className={`principle-film film-${algorithm} overview-film`}>
      <div className="film-heading">
        <div>
          <span className="film-kicker">THE BIG PICTURE / 10 秒理解全局</span>
          <h3>
            {algorithm === "hashcash"
              ? "一份请求，怎样带上工作证明？"
              : algorithm === "sha256d"
                ? "从批量候选，到可以验证的答案。"
                : "计算为什么需要一片“草稿纸”？"}
          </h3>
        </div>
        <span className="overview-duration">
          10s<span>全局概览</span>
        </span>
      </div>
      <OverviewScene algorithm={algorithm} progress={clock.progress} />
      <div className="film-chapters">
        {chapters.map((ch, i) => (
          <button
            key={ch.title}
            aria-current={i === state.phase ? "step" : undefined}
            className={i === state.phase ? "chapter-current" : ""}
            onClick={() => {
              clock.pause();
              clock.seek(ch.at * OVERVIEW_DURATION);
            }}
          >
            <span>{(ch.at * OVERVIEW_DURATION).toFixed(1)}s</span>
            {ch.title}
          </button>
        ))}
      </div>
      <div className="film-narration" aria-live="polite">
        <span className="narration-index">0{state.phase + 1}</span>
        <div>
          <h4>{chapter.title}</h4>
          <p>{chapter.text}</p>
        </div>
      </div>
      <div className="film-playback">
        <button
          className="film-play"
          aria-label={
            clock.playing
              ? "暂停全局动画"
              : clock.progress >= 1
                ? "重播10秒概览"
                : "播放全局动画"
          }
          onClick={clock.toggle}
        >
          {clock.playing ? "Ⅱ" : clock.progress >= 1 ? "↺" : "▶"}
        </button>
        <label className="film-scrubber">
          <span className="sr-only">全局动画时间轴</span>
          <input
            type="range"
            min={0}
            max={OVERVIEW_DURATION}
            step={0.01}
            value={clock.time}
            onChange={(e) => {
              clock.pause();
              clock.seek(+e.target.value);
            }}
          />
        </label>
        <span className="film-time">{clock.time.toFixed(1)} / 10s</span>
        <button
          className="film-step"
          onClick={() => {
            clock.pause();
            clock.seek(OVERVIEW_DURATION);
          }}
        >
          看完整结果
        </button>
        <button className="film-step" onClick={clock.restart}>
          重播
        </button>
      </div>
      <p className="overview-method">
        时间轴表示教学播放进度。概览把可变的搜索时间压缩为固定流程，求解实验单独记录真实耗时。
      </p>
    </div>
  );
}
