# PoW Lab

一张数字邮票，一本不断翻阅的厚书，一条罕见的素数链。十二篇交互科普故事，看看计算怎样成为证据。

## 开始

```sh
npm ci
npm run dev
```

`npm run build` 生成 `dist/`；`npm run preview` 预览生产构建。可将 dist 部署至 Cloudflare Pages。

## 阅读体验

- 首页以数字邮票为封面，从一个网站收到太多留言的故事进入 Hashcash。
- 12 篇算法故事：Hashcash、SHA-256d、Scrypt、Argon2、Equihash、Cuckoo Cycle、Ethash、Etchash、RandomX、Primecoin、kHeavyHash、VDF。
- 14 幅章节交互插画：切换指纹、展开真实搜索、在两次哈希之间停留、填草稿纸、逐次读回、改变内存与轮数、配对二进制卡片、选择图上的环、翻共享数据页、对照 epoch 刻度、执行小程序、延长素数链、查看矩阵一行、推进平方链。
- 文字串起场景、问题和原理。插画各自响应点击并保留结果，阅读速度由读者决定。
- 真实计算、数学和代码是文章之后的可选展开内容。展开时才挂载实验与代码展示；收起实验时终止计算。
- “概率与运气”从平均值与单次等待的差异出发，提供可复现的批量搜索和理论分布对照。
- 响应式排版、键盘操作和减少动态效果支持。

## 内容与实现

`src/reading/stories.ts` 管理文章的开场、段落、插画位置和延伸内容；`ReadingStory.tsx` 负责连续阅读排版。`Illustration.tsx` 绘制各篇的局部插画，`illustration-models.ts` 保存插画中可复查的小算例。

每幅插画只服务所在段落的一个想法，使用适合该机制的点击、比较、选择或步进。科普正文不要求完成任务、测验或按课程顺序阅读。页面不使用整段总览影片、固定十秒叙事或公共播放时间轴。

React + TypeScript + Vite；DOM / SVG / CSS 插画；独立 Worker 执行实际实验；hash-wasm 提供 SHA-256、Scrypt 与 Argon2id。`src/engine.ts` 为基础计算核心，`src/worker.ts` 负责预算及事件，`src/advanced/` 管理复杂算法的缩小模型。

## 真实计算与样本

指纹与双重哈希插画使用可复现的 SHA-256 样本；Hashcash 搜索插画保留挑战 `hello-pow`、nonce 0–18 的完整真实记录，并可实际复算成功答案。静态样本通过独立 Node.js crypto 核对。

内存表、数据翻页、卡片与图等插画是明确注明范围的局部示意。矩阵乘法、异或、素性检查、虚拟机状态与平方链等展示数字逐步精确计算。插画的状态格数量与过渡时间分别用于视觉解释，实际算法规模与耗时由展开的实验记录。

原有数值轨迹核心保留在 `src/films/data.ts`，继续进行 RFC / 跨实现核对，也保留 Worker 的轨迹数据接口。

## 实验口径

Hashcash 使用 SHA-256 搜索构造，区别于原始 SHA-1 邮件 stamp。输入统一为 `UTF8(challenge + ":" + decimal_nonce)`。SHA-256d 第二轮输入为第一轮的原始 32 字节；文本挑战区别于 Bitcoin 区块头协议。

Scrypt 固定盐 `pow-lab-v1`、r=8、p=1、32 字节输出，将派生结果用于前导零搜索。验证需要执行一次派生。内存工作区的理论估计为 `128 × N × r`，实际进程另有运行时开销。

基础搜索的单次预算为 15 秒 / 500 万次尝试。Hashcash / SHA-256d 难度 1–4；Scrypt 难度 1–2、N=1024/2048/4096。耗时与吞吐率描述当前实现和设备。计算可主动停止，切换文章或收起实验也会终止 Worker。

### 其余算法的模型范围

| 文章 / 路由 | 可展开的实验 | 范围 |
| --- | --- | --- |
| `#argon2` | Argon2id，m=64/256/1024 KiB、t=2、p=1 | 真实原语，小参数单次派生 |
| `#equihash` | 截断 SHA-256 的前缀配对和四索引 XOR 归零 | 广义生日问题结构模型 |
| `#cuckoo` | 8+8 节点二部图、四边简单环搜索与验证 | 图结构模型 |
| `#ethash` | epoch、64 数据项、16 次寻址混合、按需复算 | 缩小数据集的历史协议模型 |
| `#etchash` | 激活边界前后的 epoch 规则及寻址模型 | 分组规则保留，seedHash / DAG 见正式协议 |
| `#randomx` | 四寄存器、32 字内存、五类整数 / 访存指令 | 虚拟机结构模型 |
| `#primecoin` | 小整数 Cunningham 第一类链与精确素性检查 | 正式链绑定与难度见原始实现 |
| `#kheavyhash` | 4×4 / 8×8 矩阵乘法、混合与哈希 | 小矩阵结构模型 |
| `#vdf` | 顺序平方与 Wesolowski 验证等式 | 可公开分解的小模数代数模型；VDF 是相邻原语 |

模型具有 10 秒单次预算，可以导出 JSON 并修改证据重新检查。其统计与耗时只描述对应模型；正式网络的协议兼容性需要另行核对参考向量。各实验直接列出替换的哈希、数据规模、指令或群参数。

## 概率与记录

`#probability` 支持 Hashcash / SHA-256d、难度 1 / 2、10 / 30 / 100 次真实搜索。每轮挑战为 `seed:trial:index`，固定算法、难度和种子可以复现尝试次数。批量预算为 30 秒 / 100 万次尝试。

理论分布采用均匀独立哈希输出的几何模型。停止或超时保留部分样本，并标明长等待样本缺失可能带来的偏差。手动停止的累计次数与耗时是最后一次回传快照。JSON 包含每轮挑战、nonce、哈希和验证结果。

## 代码示例

每篇可展开 Python / Node.js 示例，支持 Shiki 高亮和复制。输入约定与浏览器模型一致。Argon2 Python 文件为 `argon2_demo.py`，避免与依赖包重名。

```sh
node examples/equihash.mjs hello-pow 256
python examples/cuckoo.py hello-pow 64
node examples/vdf.mjs hello-pow 256
python -m pip install argon2-cffi==25.1.0
python examples/argon2_demo.py hello-pow 64
```

`src/advanced/kernels.ts` 为 JavaScript 模型来源，修改后同步独立示例与公开资产：

```sh
node scripts/generate-examples.mjs
python scripts/generate_python_models.py
```

## 验证

```sh
python -m pip install -r requirements-test.txt
npm test
npm run build
```

测试覆盖标准 SHA-256 / RFC 7914 向量，Python / Node.js / 浏览器引擎一致性、Worker 批量计算、资源边界、证明篡改、概率统计、插画样本及小算例的精确结果、epoch 激活边界和文章路由完整性。

浏览器检查覆盖首页、12 篇文章、插画交互、折叠实验与代码、390px 嵌入视口的排版。增加文章或更改插画时，需要同时检查键盘操作与减少动态效果下的静态可读性。

## 原始资料

- [Hashcash paper](http://www.hashcash.org/papers/hashcash.pdf)
- [RFC 7914: Scrypt](https://www.rfc-editor.org/rfc/rfc7914.html)
- [Bitcoin block chain](https://developer.bitcoin.org/devguide/block_chain.html)
- [Ethereum The Merge](https://ethereum.org/roadmap/merge/)
- 其余原始论文、规范与参考代码见文章的数学与设计展开区。
