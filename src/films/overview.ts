import type { Algorithm } from "../engine.ts";
export const OVERVIEW_DURATION = 10;
export type OverviewChapter = { at: number; title: string; text: string };
export const overviewChapters: Record<Algorithm, OverviewChapter[]> = {
  hashcash: [
    {
      at: 0,
      title: "网站提出一道题",
      text: "提交请求之前，网站先给出一个计算挑战。",
    },
    {
      at: 0.15,
      title: "浏览器批量尝试",
      text: "每个候选算一次哈希，留下计算成本；整个搜索被压缩到几秒展示。",
    },
    {
      at: 0.55,
      title: "找到一个合格答案",
      text: "许多候选中，一个满足目标。浏览器把这个答案当作证明提交。",
    },
    {
      at: 0.72,
      title: "网站检查一次",
      text: "网站对提交的答案重算一次，就能确认它满足条件。",
    },
    {
      at: 0.88,
      title: "验证通过，请求继续",
      text: "全局过程：发挑战 → 多次尝试 → 提交答案 → 一次检查。",
    },
  ],
  sha256d: [
    {
      at: 0,
      title: "准备候选数据",
      text: "先确定目标，再对候选数据进行搜索。",
    },
    {
      at: 0.15,
      title: "每个候选经过两道工序",
      text: "每次尝试都连续计算两次 SHA-256，再检查最终结果。",
    },
    {
      at: 0.55,
      title: "筛出满足目标的候选",
      text: "符合条件的候选成为本次工作证明。",
    },
    {
      at: 0.72,
      title: "检查者重复两次哈希",
      text: "检查选中的候选时，执行同样的双重哈希并检查目标。",
    },
    {
      at: 0.88,
      title: "得到可检查的工作证明",
      text: "全局过程：批量候选 → 双重哈希 → 目标筛选 → 提交并验证。",
    },
  ],
  scrypt: [
    {
      at: 0,
      title: "让一次尝试用上内存",
      text: "先准备输入和参数，让计算需要一片工作区。",
    },
    {
      at: 0.15,
      title: "写满，再反复取用",
      text: "一次尝试会写入许多中间状态，再不断读回和混合。内存成为计算成本的一部分。",
    },
    {
      at: 0.55,
      title: "输出参与目标筛选",
      text: "这一轮得到一个结果；用于 PoW 搜索时，继续尝试直到满足目标。",
    },
    {
      at: 0.72,
      title: "检查者也执行一次 Scrypt",
      text: "验证提交的候选需要完整执行一次 Scrypt，同样用到计算与内存。",
    },
    {
      at: 0.88,
      title: "看见计算与内存的成本",
      text: "全局过程：候选输入 → 内存工作区 → 派生输出 → 筛选与验证。",
    },
  ],
};
export function overviewState(algorithm: Algorithm, progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const phase = overviewChapters[algorithm].reduce(
    (index, ch, i) => (p >= ch.at ? i : index),
    0,
  );
  return {
    phase,
    work: Math.max(0, Math.min(1, (p - 0.15) / 0.4)),
    transfer: Math.max(0, Math.min(1, (p - 0.55) / 0.17)),
    verification: Math.max(0, Math.min(1, (p - 0.72) / 0.16)),
    complete: p >= 0.88,
  };
}
