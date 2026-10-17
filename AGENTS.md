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
