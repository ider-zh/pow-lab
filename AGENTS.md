# PoW Lab project rules

- Teach high-school students through intuition, interactive experiments, then formal reasoning.
- Use positive, concrete public product copy; describe what users can learn and do. Avoid redundant negative capability statements. Technical limitations and security assumptions must remain accurate.
- Keep one coherent responsive design system, accessible labels, keyboard focus, and reduced-motion support.
- Each implemented algorithm lesson includes a controlled concept animation, actual computation, mathematics, sources, and runnable Python/Node.js examples.
- Distinguish concept animations, real execution traces, simulation, measurements, and estimates. Never fabricate benchmark values.
- Keep computation in cancellable Workers with time and memory budgets.
- Verify cryptographic implementations using published vectors and cross-language fixtures.
- Label teaching constructions and protocol differences explicitly. Hashcash here is a SHA-256 teaching construction, not the original SHA-1 stamp format. SHA-256d text challenges are distinct from Bitcoin block headers.
- Scrypt is a KDF used here in a search construction; VDF is an adjacent primitive. Ethereum mainnet moved to PoS in 2022.
- Keep browser assets in public/examples synchronized with examples/.
- Run npm test and npm run build before submitting changes.

- Keep probability statistics exact: use a geometric model with explicit assumptions; distinguish complete batches, censored work, and manual-stop snapshots.
- Use the same immutable input configuration for computation, display, export, and verification. Clear stale results when parameters change.
- Ignore events from replaced Workers. Release Workers and timers on route changes and component unmount.
- Load only Python/JavaScript grammars and one theme for code highlighting, lazily.

- Give each algorithm a distinct visual mechanism: nonce search for Hashcash, raw-byte transfer between two passes for SHA-256d, memory writes and data-dependent reads for Scrypt.
- Use continuous, scrubbable timelines and chapter narration for principle films. Keep the main animation prominent near the top of each lesson.
- Drive displayed hashes, memory addresses, XOR states, and bit-difference counts from reproducible computation. Identify small teaching parameters and separate playback time from runtime.
- New cryptographic trace implementations require parity checks against an independent implementation and per-step invariant tests.
- Principle films respect reduced-motion preferences and pause when the browser tab becomes hidden.

- Default principle films to a complete 10-second global overview: task → work → proof → verification → completion. Show the final outcome by 8.8 seconds and hold it for comprehension.
- Global overviews are clearly labeled conceptual time-compressed stories and render immediately, independently of solving, Worker startup, and WASM. Keep detailed numerical traces in the optional deeper view.
- Introduce roles and the work/verification cost relationship before nonces, hexadecimal strings, registers, and individual memory addresses.

- The academy contains 12 lessons. Keep atlas links, sidebar order, previous/next navigation, and Python/Node examples in sync.
- Advanced teaching constructions must state their exact substitutions (hash, dimensions, graph size, instruction subset, or group parameters). Keep formal protocol compatibility claims tied to reference vectors.
- Distinguish real Argon2id derivation from nonce-search PoW. Treat VDF as an adjacent primitive and its public small modulus as an algebra demo.
- Keep Node examples generated from kernels.ts and Python equivalents cross-checked against the browser model. Argon2 Python code uses argon2_demo.py to avoid shadowing the dependency.
- Model proof verification certifies the mathematical structure or recomputed result, not the surrounding timing or trace metadata.
