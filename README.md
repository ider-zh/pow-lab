# PoW Lab

看见计算，理解证明。面向高中生与计算机科学探索者的交互式工作量证明实验室。

## 开始

```sh
npm ci
npm run dev
```

`npm run build` 生成 `dist/`；`npm run preview` 预览生产构建。可将 dist 部署至 Cloudflare Pages。

## 已实现

- 产品首页、算法图谱与 12 门渐进课堂：Hashcash、SHA-256d、Scrypt、Argon2、Equihash、Cuckoo Cycle、Ethash、Etchash、RandomX、Primecoin、kHeavyHash、VDF。
- 默认 10 秒全局概览：完整展示任务、工作、答案与验证，8.8 秒出现完成结果；独立于真实求解和 WASM 初始化。
- 可选“深入计算细节”：Hashcash 搜索仪表 / SHA-256d 双哈希舱 / Scrypt 立体内存阵列。
- 连续时间轴、拖动回放、章节跳转、暂停、前后步进、重置与速度控制；支持减少动态效果，离开标签页自动暂停。
- 动画数据在 Worker 中预先真实计算，再按教学节奏播放。Hashcash 展示完整搜索与复算，双哈希展示原始字节及位变化，Scrypt 展示实际 ROMix 写入 / 寻址 / 异或 / BlockMix 轨迹。
- Web Worker + hash-wasm 实际求解；15 秒预算、停止控制、独立复算验证。
- 真实尝试次数、耗时、吞吐率与验证耗时；Scrypt 工作内存理论估计。
- Python / Node.js 可运行示例，统一 UTF-8 输入与测试夹具，Shiki 语法高亮。Argon2 示例使用 argon2-cffi / hash-wasm，其余示例使用标准库。
- 概率实验：10 / 30 / 100 轮真实哈希搜索，可复现的挑战种子、理论与实测分布、数据表及 JSON 导出。
- 真实搜索前 24 次轨迹回放；修改挑战或 nonce 的独立证明检查器；单次证明 JSON 导出。
- 响应式布局、键盘焦点、减少动态效果支持。

## 实验口径

Hashcash 是 SHA-256 教学搜索构造，区别于原始 SHA-1 邮件 stamp。输入统一为 `UTF8(challenge + ":" + decimal_nonce)`。SHA-256d 第二轮输入为第一轮的原始 32 字节，文本挑战用于解释机制，区别于 Bitcoin 区块头协议。Scrypt 固定盐 `pow-lab-v1`、r=8、p=1、32 字节输出，将派生结果用于前导零搜索。Scrypt 的验证仍消耗一次派生运算。

界面动画展示概念步骤，Worker 返回抽样进度与准确累计数据。吞吐率反映本实现与设备环境；工作区估计并非实际进程峰值。Hashcash/SHA-256d 难度 1–4；Scrypt 界面难度 1–2、N=1024/2048/4096。单次计算有 15 秒和 500 万次预算。

## 验证

```sh
python -m pip install -r requirements-test.txt
npm test
npm run build
```

测试包含 RFC 7914 Scrypt 向量、SHA-256 向量、双重哈希、Python/Node.js/浏览器计算模块一致性、工作预算、输入校验、几何分布区间与分位点、Worker 真实批量运行和独立验证。Worker 测试使用 Node transport shim，验证同一个模块的计算与事件行为；浏览器视觉与交互需要另行验收。

## 概率实验与记录

打开 `#probability`，选择 Hashcash 或 SHA-256d、难度 1 或 2、重复 10/30/100 次。每轮挑战为 `seed:trial:index`（index 从 0 开始），搜索的输入仍为 `challenge:nonce`。固定算法、难度和种子会得到相同尝试次数；耗时受设备与实现影响。批量预算为 30 秒 / 100 万次尝试。理论曲线基于均匀独立哈希输出的几何分布模型。

停止或预算耗尽后，保留部分样本，并说明长耗时轮次缺失可能造成的偏差。手动停止时，累计次数和耗时仅为最后一次回传快照。JSON 记录区分完整与部分数据，包含挑战、nonce、哈希和验证结果。

在课堂完成求解后，可修改输入单独检查目标条件，也可导出证明。Scrypt 示例的 `digest(challenge, nonce, N=1024)` 支持界面的三档 N 参数。

## 研究路线

12 门课堂已接通内容、概览、代码与实验。下一阶段可深化挑战签名与防重放沙盒、正式协议测试向量、模型与参考实现对照，以及整页浏览器交互验收。

## 原始资料

- [Hashcash paper](http://www.hashcash.org/papers/hashcash.pdf)
- [RFC 7914: Scrypt](https://www.rfc-editor.org/rfc/rfc7914.html)
- [Bitcoin block chain](https://developer.bitcoin.org/devguide/block_chain.html)
- [Ethereum The Merge](https://ethereum.org/roadmap/merge/)

## 架构

React + TypeScript + Vite；DOM/CSS 概念动画；独立 Worker 计算；hash-wasm 提供 SHA-256/Scrypt/Argon2id。`src/engine.ts` 为计算核心，`src/worker.ts` 负责预算及事件，`examples/` 为双语言教学代码。`src/advanced/` 管理后九门课堂的内容、10 秒概览与结构模型。

## 界面验收清单

- 桌面与 390px 移动端检查导航、课堂、概率图表和横向代码滚动。
- 播放 / 暂停 / 单步 / 重置，检查减少动态效果设置。
- 运行三种算法，停止长实验，再切换课堂，确认旧 Worker 结果不会覆盖新实验。
- 在 Python / Node.js 间切换，检查语法高亮和复制。
- 运行概率实验，核对频数总和、数据导出及相同种子的可复现性。
- 修改证明的挑战与 nonce，观察重新计算后的目标判定。

## 原理影片的数据口径

| 页面 | 画面主题 | 数据与交互 |
| --- | --- | --- |
| Hashcash | 搜索仪表、哈希转子、目标窗口、证明收据 | 固定挑战 hello-pow、难度 1；完整回放 nonce 0–18 的真实搜索，独立复算成功输入 |
| SHA-256d | 双哈希舱、32 字节矩阵、字节传递、雪崩效应 | 切换 hello-pow:0 / hello-pow:1；展示真实的两轮 SHA-256 与 256 位差异计数 |
| Scrypt | 立体内存阵列、动态地址探针、XOR 寄存器 | 可切换 N=16/32，r=1，p=1；PBKDF2 → ROMix → PBKDF2 的完整小参数计算 |

Scrypt 轨迹实现按照 RFC 7914 使用 Salsa20/8 与 BlockMix，记录每个 V[i] 和每次 Integerify(X) mod N。N=16/32 的完整输出通过独立 Node.js scryptSync 对照，逐次验证读取索引与异或结果。影片时间表示教学播放进度，独立实验记录真实计算耗时。

`src/films/` 包含独立场景、连续播放时钟与数据生成模块。场景通过 DOM / SVG 绘制；动画的数值变化来自预计算的真实状态，几何运动用于引导视线。后续新增算法应设计其专属画面主体，优先呈现算法独有的机制。

### 两层动画视角

默认展示 10 秒概念概览，压缩可变的实际工作时间，让学习者先理解整个任务如何完成。Hashcash 强调多次尝试与一次验证的成本关系；SHA-256d 强调每个候选经过两轮哈希；Scrypt 强调计算与内存工作区。概览中的格子、流程和播放时间属于教学示意，真实性能由独立求解实验记录。

“深入计算细节”按需启动 Worker 生成真实轨迹，保留慢放、寄存器、字节矩阵和寻址细节。页面默认概览由即时可用的概念状态机驱动，结果出现时间固定；真实实验的随机搜索时间保持原有测量口径。

## 完整课堂与实验分级

| 课堂 / 路由 | 实验内容 | 与正式协议的关系 |
| --- | --- | --- |
| `#argon2` | 真实 Argon2id 派生，m=64/256/1024 KiB、t=2、p=1 | 完整原语、教学参数；用于观察单次派生 |
| `#equihash` | 截断 SHA-256 的前缀配对和四索引 XOR 归零 | 广义生日问题结构模型 |
| `#cuckoo` | 8+8 节点二部图、四边简单环搜索与验证 | 图论证明结构模型 |
| `#ethash` | epoch 计算、64 数据项、16 次寻址混合、按需复算 | 缩小数据集的结构模型；研究历史 Ethash |
| `#etchash` | 分叉边界两侧的 epoch 规则与同类寻址模型 | 保留分组规则；正式 seedHash 与 DAG 由规范定义 |
| `#randomx` | 四寄存器、32 字内存、五类整数/访存指令 | 专用 VM 的结构模型 |
| `#primecoin` | 小整数 Cunningham 第一类链、精确素性检查 | 素数链模型，正式链绑定与难度规则见源码 |
| `#kheavyhash` | 4×4 / 8×8 矩阵乘法、混合与哈希 | 小矩阵结构模型 |
| `#vdf` | 128/256/512 次顺序平方、小模数 Wesolowski 验证等式 | 代数结构模型，模数公开可分解；VDF 为相邻原语 |

每页独立展示目的、数学直觉、模型边界、原始资料及 Python/Node.js 示例。动画为固定 10 秒概念概览，8.8 秒进入结尾；实验在可取消 Worker 内实际计算，具有 10 秒上限，可导出 JSON 并修改证据重新检查。模型统计与耗时只描述对应教学构造。

### 示例运行与维护

```sh
node examples/equihash.mjs hello-pow 256
python examples/cuckoo.py hello-pow 64
node examples/vdf.mjs hello-pow 256
python -m pip install argon2-cffi==25.1.0
python examples/argon2_demo.py hello-pow 64
```

Argon2 Python 文件命名为 `argon2_demo.py`，方便正常导入 `argon2` 依赖包。JavaScript 原理模型的源文件是 `src/advanced/kernels.ts`。修改后执行以下命令同步自包含示例与浏览器代码资产：

```sh
node scripts/generate-examples.mjs
python scripts/generate_python_models.py
npm test
npm run build
```

测试覆盖全部九门的跨语言结果、模型参数上限、证据篡改、epoch 分叉边界，以及生产 Worker 的运行与验证消息。教学模型的正确性与正式网络协议兼容性分别评估；本仓库当前不把结构模型输出作为链上证明。
