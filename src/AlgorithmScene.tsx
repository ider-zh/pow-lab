import type { Algorithm } from "./engine";
// Conceptual views intentionally show data shapes rather than invented execution values.
export default function AlgorithmScene({
  algorithm,
  step,
}: {
  algorithm: Algorithm;
  step: number;
}) {
  if (algorithm === "scrypt")
    return (
      <div className="algorithm-scene">
        <svg
          viewBox="0 0 720 220"
          role="img"
          aria-label="Scrypt 概念示意：先展开输入，将中间状态写入工作区，再访问并混合，最后生成输出"
        >
          <path d="M120 110H240M480 110H590" className="scene-wire" />
          <rect
            x={22}
            y={78}
            width={100}
            height={64}
            rx={8}
            className={step === 0 ? "scene-box highlighted" : "scene-box"}
          />
          <text x={72} y={105} textAnchor="middle">
            输入展开
          </text>
          <text x={72} y={124} textAnchor="middle" className="scene-small">
            PBKDF2
          </text>
          {Array.from({ length: 32 }, (_, i) => (
            <rect
              key={i}
              x={245 + (i % 8) * 27}
              y={53 + Math.floor(i / 8) * 28}
              width={21}
              height={21}
              rx={3}
              className={`memory-cell ${step === 1 || (step === 2 && [3, 11, 18, 25].includes(i)) ? "filled" : ""}`}
            />
          ))}
          <text x={350} y={194} textAnchor="middle" className="scene-small">
            ROMix 工作区 · 格子仅示意数据块
          </text>
          {step === 2 && (
            <path
              d="M336 40Q450 0 455 40M330 175Q260 211 263 175"
              className="scene-path"
            />
          )}
          <rect
            x={590}
            y={78}
            width={108}
            height={64}
            rx={8}
            className={step === 3 ? "scene-box highlighted" : "scene-box"}
          />
          <text x={644} y={105} textAnchor="middle">
            派生输出
          </text>
          <text x={644} y={124} textAnchor="middle" className="scene-small">
            32 bytes
          </text>
        </svg>
      </div>
    );
  const double = algorithm === "sha256d";
  return (
    <div className="algorithm-scene">
      <svg
        viewBox="0 0 720 220"
        role="img"
        aria-label={
          double
            ? "双重哈希概念示意：UTF-8 输入经过两次 SHA-256，第二轮输入为原始 32 字节，再检查目标"
            : "哈希搜索概念示意：挑战和 nonce 编码后进入 SHA-256，输出与目标比较，随后改变 nonce"
        }
      >
        <path d="M154 93H230M354 93H414M538 93H584" className="scene-wire" />
        <path
          d="M637 130V181H90V130"
          className={step === 3 ? "scene-path" : "scene-wire"}
        />
        <rect
          x={28}
          y={57}
          width={126}
          height={73}
          rx={8}
          className={
            step === 0 || step === 3 ? "scene-box highlighted" : "scene-box"
          }
        />
        <text x={91} y={86} textAnchor="middle">
          challenge : nonce
        </text>
        <text x={91} y={110} textAnchor="middle" className="scene-small">
          UTF-8 bytes
        </text>
        <rect
          x={230}
          y={57}
          width={124}
          height={73}
          rx={8}
          className={step === 1 ? "scene-box highlighted" : "scene-box"}
        />
        <text x={292} y={86} textAnchor="middle">
          SHA-256
        </text>
        <text x={292} y={110} textAnchor="middle" className="scene-small">
          {double ? "第 1 次哈希" : "固定长度映射"}
        </text>
        <rect
          x={414}
          y={57}
          width={124}
          height={73}
          rx={8}
          className={
            step === 1 && double ? "scene-box highlighted" : "scene-box"
          }
        />
        <text x={476} y={86} textAnchor="middle">
          {double ? "SHA-256" : "256-bit hash"}
        </text>
        <text x={476} y={110} textAnchor="middle" className="scene-small">
          {double ? "输入为原始 32 字节" : "64 个十六进制字符"}
        </text>
        <rect
          x={584}
          y={57}
          width={108}
          height={73}
          rx={8}
          className={step === 2 ? "scene-box highlighted" : "scene-box"}
        />
        <text x={638} y={86} textAnchor="middle">
          检查目标
        </text>
        <text x={638} y={110} textAnchor="middle" className="scene-small">
          前导零条件
        </text>
        <text x={365} y={205} textAnchor="middle" className="scene-small">
          改变 nonce，开始下一次尝试
        </text>
      </svg>
    </div>
  );
}
