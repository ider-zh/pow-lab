import type { AdvancedId } from "./config";
export type Lesson = {
  id: AdvancedId;
  name: string;
  tag: string;
  question: string;
  desc: string;
  symbol: string;
  scope: string;
  boundary: string;
  intuition: string;
  mechanism: string;
  math: string;
  mathText: string;
  application: string;
  source: string;
  sourceName: string;
  control: string;
  defaultParameter: number;
  optionLabels?: Record<number, string>;
  takeaway: string;
};
export const advancedLessons: Lesson[] = [
  {
    id: "argon2",
    name: "Argon2",
    tag: "04 / 内存困难原语",
    symbol: "▤",
    question: "如何把内存、轮数和并行度写进计算成本？",
    desc: "用多轮填充与引用内存块，研究可调节的派生成本。",
    scope: "真实 Argon2id · 小参数",
    boundary:
      "实验执行 Argon2id v1.3 的真实派生，m=64/256/1024 KiB、t=2、p=1。这里观察单次派生；PoW 还需加入候选搜索和目标条件。",
    intuition:
      "想象多位同学分区域填写一张大表格：新格子的内容取决于之前填写的格子。表格有多大、填写多少遍、分成几条通道，共同决定工作。",
    mechanism:
      "Argon2 用 m 指定内存，t 指定遍历轮数，p 指定通道数。Argon2id 第一轮前半部分采用数据无关寻址，其后采用数据相关寻址。",
    math: "m′ = 4p × floor(m / 4p)",
    mathText:
      "内存组织为 1 KiB 的块，实际块数按通道与分段边界对齐。m 与 t 是成本参数；耗时还取决于实现与设备。",
    application:
      "用于密码派生，也可作为 PoW 构造中的原语。验证一次候选通常仍需承担一次派生成本。",
    source: "https://www.rfc-editor.org/rfc/rfc9106.html",
    sourceName: "RFC 9106",
    control: "参数内存 m / KiB",
    defaultParameter: 64,
    takeaway: "一次派生，让时间和内存共同参与。",
  },
  {
    id: "equihash",
    name: "Equihash",
    tag: "05 / 广义生日问题",
    symbol: "⊕",
    question: "能否把许多候选，合并成一份容易检查的答案？",
    desc: "分组、碰撞与异或，让搜索者提交一组有结构的索引。",
    scope: "碰撞结构模型",
    boundary:
      "模型采用 16 位截断 SHA-256、四个不同索引、8 位前缀配对与 XOR 归零，展示广义生日问题。正式 Equihash 使用特定 BLAKE2b、个性化参数、递归碰撞规则与规范编码。",
    intuition:
      "把很多彩色卡片按相同颜色分组，再两两组合，使一段颜色抵消。继续寻找能让全部颜色抵消的一组卡片。",
    mechanism:
      "求解者存储并匹配大量哈希候选，逐层消去前缀；证明保留少量索引。验证者重算对应叶子，并检查异或、不同索引与结构约束。",
    math: "hₐ ⊕ hᵦ ⊕ h𝚌 ⊕ h𝚍 = 0",
    mathText:
      "四个值异或为零是本模型的最终条件；模型还检查两个索引对的高 8 位相等。正式协议具有更多层级与顺序约束。",
    application:
      "适合研究内存密集求解与紧凑验证。模型的候选数量和运行时间只描述本缩小模型。",
    source: "https://github.com/khovratovich/equihash",
    sourceName: "作者参考实现",
    control: "候选叶子数量",
    defaultParameter: 256,
    takeaway: "大量碰撞搜索，换来少量可检查的索引。",
  },
  {
    id: "cuckoo",
    name: "Cuckoo Cycle",
    tag: "06 / 图论搜索",
    symbol: "↻",
    question: "在一张复杂网络中，怎样找出一个指定长度的环？",
    desc: "把候选映射为边，修剪与搜索，最后提交一个闭合环。",
    scope: "二部图四边环模型",
    boundary:
      "模型用 SHA-256 映射 8+8 个节点，搜索长度 4 的简单环，并提交四条边的编号。正式 Cuckoo Cycle 使用指定边生成规则、图规模与目标环长；模型突出图结构。",
    intuition:
      "把两排站点连接成很多线路。沿几条线路出发，最后回到起点，便找到一个环；没有回路的枝条可以先排除。",
    mechanism:
      "挑战决定伪随机二部图。求解需要处理很多边；验证只需根据证明重新生成相关边，检查节点度数、边的唯一性与连通关系。",
    math: "简单环：每个环上节点的度数 = 2",
    mathText:
      "本模型搜索四个不同节点组成的矩形环。一般图中，仅检查度数不足以保证单一环，还需检查连通性；二部图四边模型同时检查四个不同端点和四条不同连接。",
    application:
      "展示内存访问、图修剪与紧凑结构证明。本实验直接寻找矩形环，便于观察和复查。",
    source: "https://github.com/tromp/cuckoo",
    sourceName: "Cuckoo Cycle 原始实现",
    control: "生成边的数量",
    defaultParameter: 64,
    takeaway: "在全图里搜索，只提交环上的边。",
  },
  {
    id: "ethash",
    name: "Ethash",
    tag: "07 / 历史协议 · 数据集访问",
    symbol: "▧",
    question: "怎样让每次搜索都依赖一份共享的大数据集？",
    desc: "从 epoch 与数据集出发，沿着状态不断读回和混合。",
    scope: "DAG 寻址结构模型",
    boundary:
      "模型用 64 个 32 位 SHA-256 数据项与 16 次 FNV 风格混合展示寻址。正式 Ethash 的 Keccak、cache、DAG 生成、数据规模和 Hashimoto 规则由协议定义。",
    intuition:
      "所有人都有一本按同一规则印出的厚书。每次计算都从书中选页，将内容混入答案；下一页的位置又由当前状态决定。",
    mechanism:
      "数据集随 epoch 更新。挖矿者可以持有完整数据集；验证者也可根据 cache 重新生成需要的数据项，付出更多计算以减少存储。",
    math: "epoch = floor(block / 30000)",
    mathText:
      "本实验保留 epoch 的分组思想，使用缩小的数据集展示完整存储与按需重算得到相同结果。它的字节量与耗时属于结构模型。",
    application:
      "以太坊主网在 2022 年 9 月 15 日完成 The Merge 后转向 PoS。此页研究历史 Ethash 机制。",
    source:
      "https://ethereum.org/developers/docs/consensus-mechanisms/pow/mining/mining-algorithms/ethash/",
    sourceName: "Ethereum Ethash 文档",
    control: "示例区块高度",
    defaultParameter: 11700000,
    takeaway: "共享数据集，让存储与计算相互交换。",
  },
  {
    id: "etchash",
    name: "Etchash",
    tag: "08 / Epoch 规则调整",
    symbol: "½",
    question: "改变 epoch 的节奏，为什么会改变数据集的增长？",
    desc: "比较 epoch 周期，理解 Ethereum Classic 的协议调整。",
    scope: "Epoch 对比 + 寻址结构模型",
    boundary:
      "模型实现分叉前后 epochLength 的 30000/60000 高度规则，结合缩小的寻址模型。正式 seedHash 仍有独立规则，不能仅用 epoch 值替代；完整协议见 ECIP-1099。",
    intuition:
      "如果原来每三万页就换一本更厚的书，现在每六万页才换，书变厚的节奏就会变化。页码分组与实际生成内容仍各有规则。",
    mechanism:
      "ECIP-1099 校准 epoch 长度，影响 DAG 与 cache 的规模计算。它沿用数据集访问的核心思想，重点调整资源增长路径。",
    math: "分叉后 epoch = floor(block / 60000)",
    mathText:
      "Ethereum Classic 主网在高度 11700000 激活该调整。实验可切换分叉边界两侧，比较 epoch 与相同输入的模型输出。",
    application:
      "用于观察协议如何通过参数与时序规则影响设备资源需求。模型区分 epoch 分组与真实 seedHash 生成。",
    source: "https://ecips.ethereumclassic.org/ECIPs/ecip-1099",
    sourceName: "ECIP-1099",
    control: "分叉边界示例高度",
    defaultParameter: 11700000,
    takeaway: "改变增长节奏，也是工作量证明的设计。",
  },
  {
    id: "randomx",
    name: "RandomX",
    tag: "09 / 随机程序",
    symbol: "⌘",
    question: "如果工作是一段不断变化的程序呢？",
    desc: "让指令、寄存器和内存一起参与计算，研究通用 CPU 的优势。",
    scope: "整数虚拟机结构模型",
    boundary:
      "模型执行 ADD/XOR/MUL/LOAD/STORE 五种操作、四个 32 位寄存器和 32 字内存。正式 RandomX 包含专用 VM、浮点、分支、JIT、cache/dataset 和指定哈希链。",
    intuition:
      "一道题不再只是反复按同一个按钮，而是临时发给你一段小程序，让你完成运算、读写草稿纸，再交出最终状态。",
    mechanism:
      "RandomX 结合随机代码执行与内存困难技术，面向通用 CPU 设计。正式实现的快速与轻量模式以不同资源成本生成一致结果。",
    math: "状态ᵢ₊₁ = 执行(指令ᵢ, 状态ᵢ)",
    mathText:
      "模型将每个 32 位整数运算限制在模 2³² 范围，确保 Python、Node.js 与浏览器得到一致结果。它用于观察指令执行，而非测量正式 RandomX 算力。",
    application:
      "用于研究硬件适配：通用 CPU 的整数、浮点、分支和缓存能力共同影响执行效率。",
    source: "https://github.com/tevador/RandomX",
    sourceName: "RandomX 设计与规范",
    control: "生成指令数量",
    defaultParameter: 16,
    takeaway: "把工作变成程序，让通用计算能力参与竞争。",
  },
  {
    id: "primecoin",
    name: "Primecoin",
    tag: "10 / 素数链搜索",
    symbol: "ℙ",
    question: "工作量证明能否同时留下数学上的结果？",
    desc: "寻找连续满足素数条件的链，让证据具有可观察的数学结构。",
    scope: "Cunningham 第一类链模型",
    boundary:
      "模型寻找长度 3–5 的小素数链，挑战决定搜索起点，用试除法精确检查小整数。正式 Primecoin 还规定区块头绑定、链起源、乘数、双孪生链及难度规则。",
    intuition:
      "寻找一个素数，再把它乘以二加一。如果新数仍是素数，就继续。连续成功形成一条稀少的链。",
    mechanism:
      "Primecoin 将特定素数链用于 PoW。求解是在大量候选中搜索，证明则给出可复查的链和相关起源。",
    math: "pᵢ₊₁ = 2pᵢ + 1",
    mathText:
      "例如 2 → 5 → 11 → 23 是一条小规模 Cunningham 第一类链。链上的每一项都需要通过相应的素性检查。",
    application:
      "用于讨论“有用工作”：数学结构可被检查，但可调难度、挑战绑定和成本公平性仍需要协议设计。",
    source: "https://github.com/primecoin/primecoin/blob/master/src/prime.cpp",
    sourceName: "Primecoin 素数链实现",
    control: "目标链长度",
    defaultParameter: 4,
    takeaway: "搜索稀少的数学结构，提交可复查的链。",
  },
  {
    id: "kheavyhash",
    name: "kHeavyHash",
    tag: "11 / 哈希与矩阵",
    symbol: "▦",
    question: "让哈希结果穿过一个矩阵，会发生什么？",
    desc: "将向量乘法与哈希组合，观察固定计算流水线。",
    scope: "小矩阵结构模型",
    boundary:
      "模型使用 4×4 或 8×8 的确定性矩阵、4 位向量与 SHA-256 展示乘法、混合和再哈希。正式 kHeavyHash 使用协议规定的矩阵生成、维度、截断与域分离哈希。",
    intuition:
      "把输入拆成一列数字，交给一个数字变换表。每一行组合这些数字，得到新的列，再将它与原数据混合。",
    mechanism:
      "kHeavyHash 将矩阵运算与哈希过程组合。完整实现中的矩阵来自预 PoW 哈希，并按协议处理候选 nonce。",
    math: "yᵢ = Σ Mᵢⱼ xⱼ",
    mathText:
      "本模型把乘积按模 16 缩小，再与输入向量异或并哈希。维度翻倍时，直接矩阵乘法的标量乘法数量从 d² 变成 4d²。",
    application:
      "用于研究混合计算流水线与硬件实现。正式链上结果应以 Kaspa 的参考实现和协议规则核对。",
    source: "https://github.com/kaspanet/rusty-kaspa/tree/master/consensus/pow",
    sourceName: "Kaspa PoW 参考代码",
    control: "矩阵维度",
    defaultParameter: 4,
    optionLabels: { 4: "4 × 4", 8: "8 × 8" },
    takeaway: "把矩阵变换与哈希串成一条计算流水线。",
  },
  {
    id: "vdf",
    name: "VDF",
    tag: "12 / 相邻技术 · 顺序延迟",
    symbol: "⏱",
    question: "怎样要求计算按顺序推进，同时留下可验证的证据？",
    desc: "沿着平方链前进，研究顺序工作与紧凑验证等式。",
    scope: "小模数 Wesolowski 结构模型",
    boundary:
      "模型用公开可分解的小模数 1022117 展示重复平方和证明等式。安全 VDF 需要合适的未知阶群、大参数及安全挑战生成；此处参数用于算例和逐步复查。",
    intuition:
      "每一步都依赖上一步的结果，像接力传球。最后除了结果，还交出一份让别人用较少计算检查的证明。",
    mechanism:
      "VDF 是可验证延迟原语。这里按 Wesolowski 的思路，给出重复平方的输出与商指数证明，比较顺序步骤和验证工作。",
    math: "y = x^(2ᵀ) mod N",
    mathText:
      "令 2ᵀ = qℓ + r，证明 π = x^q，则检查 π^ℓ × x^r ≡ y (mod N)。验证者用快速模幂计算 r 与等式两侧；小参数模型只展示代数机制。",
    application:
      "用于观察公共随机性、时间顺序与可验证延迟。它与概率搜索型 PoW 是相邻但不同的密码学工具。",
    source: "https://eprint.iacr.org/2018/623",
    sourceName: "Wesolowski VDF 论文",
    control: "连续平方次数 T",
    defaultParameter: 256,
    takeaway: "顺序计算产生结果，代数关系帮助检查。",
  },
];
export const advancedById = (id: string) =>
  advancedLessons.find((a) => a.id === id);
