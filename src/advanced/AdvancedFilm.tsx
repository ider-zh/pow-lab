import type { Lesson } from "./catalog";
import AdvancedDiagram from "./AdvancedDiagram";
import { useFilmClock } from "../films/useFilmClock";
import "../films/films.css";
export default function AdvancedFilm({ lesson }: { lesson: Lesson }) {
  const clock = useFilmClock(true, 10);
  const p = clock.progress,
    complete = p >= 0.88;
  const phase = [0, 0.15, 0.55, 0.72, 0.88].reduce(
    (s, n, i) => (p >= n ? i : s),
    0,
  );
  const id = lesson.id;
  return (
    <div className={`principle-film advanced-film theme-${id}`}>
      <div className="film-heading">
        <div>
          <span className="film-kicker">THE BIG PICTURE / 10 秒理解全局</span>
          <h3>{lesson.takeaway}</h3>
        </div>
        <span className="overview-duration">
          10s<span>概念全景</span>
        </span>
      </div>
      <div className="advanced-film-canvas">
        <AdvancedDiagram lesson={lesson} progress={p} />
        <div className="advanced-story-status">
          <span>{phase >= 4 ? "✓" : `0${phase + 1}`}</span>
          <b>{lesson.chapters[phase][0]}</b>
          <small>
            {phase >= 4 ? "本轮概览完成" : "10 秒压缩叙事 · 概念动画"}
          </small>
        </div>
      </div>
      <div className="film-chapters">
        {lesson.chapters.map(([title], i) => (
          <button
            key={title}
            className={phase === i ? "chapter-current" : ""}
            onClick={() => {
              clock.pause();
              clock.seek([0, 1.5, 5.5, 7.2, 8.8][i]);
            }}
          >
            <span>0{i + 1}</span>
            {title}
          </button>
        ))}
      </div>
      <div className="film-narration" aria-live="polite">
        <span className="narration-index">0{phase + 1}</span>
        <div>
          <h4>{lesson.chapters[phase][0]}</h4>
          <p>{lesson.chapters[phase][1]}</p>
        </div>
      </div>
      <div className="film-playback">
        <button
          className="film-play"
          onClick={clock.toggle}
          aria-label={clock.playing ? "暂停全局动画" : "播放或重播全局动画"}
        >
          {clock.playing ? "Ⅱ" : complete ? "↺" : "▶"}
        </button>
        <label className="film-scrubber">
          <span className="sr-only">全局动画时间轴</span>
          <input
            type="range"
            min={0}
            max={10}
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
            clock.seek(10);
          }}
        >
          看全局结果
        </button>
        <button className="film-step" onClick={clock.restart}>
          重播
        </button>
      </div>
      <p className="overview-method">
        画面示意完整机制，播放时间与实际耗时分别记录。{lesson.scope}
        的计算边界见下方实验。
      </p>
    </div>
  );
}
