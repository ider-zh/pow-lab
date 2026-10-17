export const clamp = (n: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, n));
export function ByteGrid({
  value,
  reveal = 1,
  compare,
  label,
}: {
  value: string;
  reveal?: number;
  compare?: string;
  label?: string;
}) {
  const values = value.match(/../g) ?? [];
  return (
    <div
      className="byte-matrix"
      role="img"
      aria-label={label ?? `${values.length} 字节：${value}`}
    >
      {values.map((byte, i) => (
        <span
          aria-hidden="true"
          key={i}
          className={`${i < values.length * reveal ? "visible-byte" : ""} ${compare && byte !== compare.slice(i * 2, i * 2 + 2) ? "changed-byte" : ""}`}
          style={{ "--byte": parseInt(byte, 16) / 255 } as React.CSSProperties}
        >
          {i < values.length * reveal ? byte : "·"}
        </span>
      ))}
    </div>
  );
}
export function Rotor({
  progress,
  label,
  second = false,
}: {
  progress: number;
  label: string;
  second?: boolean;
}) {
  return (
    <svg className="hash-rotor" viewBox="0 0 210 210" aria-hidden="true">
      <defs>
        <radialGradient id={second ? "rotor-glow-b" : "rotor-glow-a"}>
          <stop stopColor="currentColor" stopOpacity=".18" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx={105}
        cy={105}
        r={100}
        fill={`url(#${second ? "rotor-glow-b" : "rotor-glow-a"})`}
      />
      <g transform={`rotate(${progress * 360} 105 105)`}>
        {Array.from({ length: 48 }, (_, i) => (
          <line
            key={i}
            x1={105}
            y1={18}
            x2={105}
            y2={i % 4 === 0 ? 30 : 23}
            transform={`rotate(${i * 7.5} 105 105)`}
            stroke="currentColor"
            opacity={i / 64 + 0.2}
            strokeWidth={i % 4 === 0 ? 2 : 1}
          />
        ))}
      </g>
      <circle
        cx={105}
        cy={105}
        r={65}
        fill="none"
        stroke="currentColor"
        strokeOpacity=".2"
      />
      <circle
        cx={105}
        cy={105}
        r={65}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="75 334"
        transform={`rotate(${-progress * 540} 105 105)`}
      />
      <text x={105} y={103} textAnchor="middle">
        SHA
      </text>
      <text x={105} y={124} textAnchor="middle" className="rotor-small">
        {label}
      </text>
    </svg>
  );
}
