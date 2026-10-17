import { useState } from "react";
import type { Algorithm } from "../engine";
import OverviewFilmPlayer from "./OverviewFilmPlayer";
import TraceFilmPlayer from "./TraceFilmPlayer";
import "./films.css";
export default function FilmPlayer({ algorithm }: { algorithm: Algorithm }) {
  const [mode, setMode] = useState<"overview" | "trace">("overview");
  return (
    <div className="film-experience">
      <div className="film-view-switch" role="group" aria-label="原理动画视角">
        <button
          className={mode === "overview" ? "view-selected" : ""}
          aria-pressed={mode === "overview"}
          onClick={() => setMode("overview")}
        >
          10 秒全局概览
        </button>
        <button
          className={mode === "trace" ? "view-selected" : ""}
          aria-pressed={mode === "trace"}
          onClick={() => setMode("trace")}
        >
          深入计算细节
        </button>
        <span>先看全貌，再探索内部</span>
      </div>
      {mode === "overview" ? (
        <OverviewFilmPlayer key={algorithm} algorithm={algorithm} />
      ) : (
        <TraceFilmPlayer key={algorithm} algorithm={algorithm} />
      )}
    </div>
  );
}
