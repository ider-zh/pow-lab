# PoW Lab

看见计算，理解证明。面向高中生与计算机科学探索者的交互式工作量证明实验室。

## 开始

```sh
npm ci
npm run dev
```

`npm run build` 生成 `dist/`；`npm run preview` 预览生产构建。可将 dist 部署至 Cloudflare Pages。

## 已实现

- 产品首页、算法图谱、Hashcash / SHA-256d / Scrypt 三门渐进课堂。
- 概念动画的播放、暂停、前后单步、重置和速度控制。
- Web Worker + hash-wasm 实际求解；15 秒预算、停止控制、独立复算验证。
- 真实尝试次数、耗时、吞吐率与验证耗时；Scrypt 工作内存理论估计。
- 标准库 Python / Node.js 可运行示例，统一 UTF-8 输入与测试夹具。
- 响应式布局、键盘焦点、减少动态效果支持。

## 实验口径

Hashcash 是 SHA-256 教学搜索构造，区别于原始 SHA-1 邮件 stamp。输入统一为 `UTF8(challenge + ":" + decimal_nonce)`。SHA-256d 第二轮输入为第一轮的原始 32 字节，文本挑战用于解释机制，区别于 Bitcoin 区块头协议。Scrypt 固定盐 `pow-lab-v1`、r=8、p=1、32 字节输出，将派生结果用于前导零搜索。Scrypt 的验证仍消耗一次派生运算。

界面动画展示概念步骤，Worker 返回抽样进度与准确累计数据。吞吐率反映本实现与设备环境；工作区估计并非实际进程峰值。Hashcash/SHA-256d 难度 1–4；Scrypt 界面难度 1–2、N=1024/2048/4096。单次计算有 15 秒和 500 万次预算。

## 验证

```sh
npm test
npm run build
```

测试包含 RFC 7914 Scrypt 向量、SHA-256 向量、双重哈希、Python/Node.js/浏览器引擎一致性与参数校验。

## 研究路线

下一阶段：概率分布批量实验、结果导出、Shiki 代码高亮、Equihash 与 Cuckoo Cycle 小参数模型。后续引入 RandomX、Ethash/Etchash、Primecoin 和 VDF 教学模型。图谱中的研究路线条目与可运行课堂分别标注。

## 原始资料

- [Hashcash paper](http://www.hashcash.org/papers/hashcash.pdf)
- [RFC 7914: Scrypt](https://www.rfc-editor.org/rfc/rfc7914.html)
- [Bitcoin block chain](https://developer.bitcoin.org/devguide/block_chain.html)
- [Ethereum The Merge](https://ethereum.org/roadmap/merge/)

## 架构

React + TypeScript + Vite；DOM/CSS 概念动画；独立 Worker 计算；hash-wasm 提供 SHA-256/Scrypt。`src/engine.ts` 为计算核心，`src/worker.ts` 负责预算及事件，`examples/` 为标准库教学代码。
