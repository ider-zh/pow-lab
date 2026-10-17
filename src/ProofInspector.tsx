import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "./search";
import { downloadJson } from "./download";
export default function ProofInspector({ result }: { result: SearchResult }) {
  const [challenge, setChallenge] = useState(result.challenge);
  const [nonce, setNonce] = useState(String(result.nonce));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState<{
    hash: string;
    valid: boolean;
    elapsed: number;
  } | null>(null);
  const worker = useRef<Worker | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      worker.current?.terminate();
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  function verify() {
    setBusy(true);
    setError("");
    setVerification(null);
    const w = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    const stop = () => {
      w.terminate();
      worker.current = null;
      setBusy(false);
      if (timeout.current) clearTimeout(timeout.current);
    };
    timeout.current = setTimeout(() => {
      setError("本次验证已达到时间预算，请重试");
      stop();
    }, 15000);
    w.onerror = (e) => {
      setError(e.message);
      stop();
    };
    w.onmessage = ({ data }) => {
      if (worker.current !== w) return;
      if (data.type === "error") setError(data.message);
      else setVerification(data);
      stop();
    };
    w.postMessage({
      mode: "verify",
      algorithm: result.algorithm,
      N: result.N,
      difficulty: result.difficulty,
      challenge,
      nonce: nonce.trim() === "" ? NaN : Number(nonce),
    });
  }
  return (
    <div className="proof-inspector">
      <div className="panel-title">
        <h3>得到证明，再亲手检查。</h3>
        <button
          className="secondary"
          onClick={() =>
            downloadJson("pow-lab-proof.json", {
              schemaVersion: 1,
              exportedAt: new Date().toISOString(),
              inputEncoding: 'UTF8(challenge + ":" + decimal_nonce)',
              salt: result.algorithm === "scrypt" ? "pow-lab-v1" : undefined,
              ...result,
            })
          }
        >
          导出本次证明 ↗
        </button>
      </div>
      <p>
        验证者只拿到挑战和
        nonce，就可以重新计算。修改任一输入，观察答案如何变化；偶尔新的输入也可能恰好命中。
      </p>
      <div className="verify-inputs">
        <label>
          验证用挑战
          <input
            disabled={busy}
            value={challenge}
            maxLength={120}
            onChange={(e) => {
              setChallenge(e.target.value);
              setVerification(null);
            }}
          />
        </label>
        <label>
          验证用 nonce
          <input
            disabled={busy}
            value={nonce}
            inputMode="numeric"
            onChange={(e) => {
              setNonce(e.target.value);
              setVerification(null);
            }}
          />
        </label>
        <button disabled={busy} onClick={verify}>
          {busy ? "验证中…" : "检查目标条件"}
        </button>
      </div>
      {verification && (
        <div className="verification-result" role="status">
          <b>{verification.valid ? "满足当前目标 ✓" : "本次结果与目标不同"}</b>
          <span>{verification.elapsed.toFixed(2)} ms</span>
          <code>{verification.hash}</code>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
