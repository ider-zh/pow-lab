import { useCallback, useEffect, useRef, useState } from "react";
export function useFilmClock(ready: boolean, duration = 20) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const frame = useRef(0);
  const position = useRef(0);
  const seek = useCallback(
    (value: number) => {
      position.current = Math.max(0, Math.min(duration, value));
      setTime(position.current);
    },
    [duration],
  );
  useEffect(() => {
    if (
      ready &&
      !document.hidden &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      setPlaying(true);
  }, [ready]);
  useEffect(() => {
    if (!ready || !playing) return;
    let last = performance.now(),
      paint = last;
    const tick = (now: number) => {
      position.current = Math.min(
        duration,
        position.current + ((now - last) / 1000) * speed,
      );
      last = now;
      if (now - paint >= 32 || position.current >= duration) {
        setTime(position.current);
        paint = now;
      }
      if (position.current >= duration) {
        setPlaying(false);
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [ready, playing, speed, duration]);
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);
  const toggle = () => {
    if (position.current >= duration) seek(0);
    setPlaying((v) => !v);
  };
  return {
    time,
    progress: time / duration,
    playing,
    speed,
    setSpeed,
    seek,
    toggle,
    pause: () => setPlaying(false),
    restart: () => {
      seek(0);
      setPlaying(true);
    },
  };
}
