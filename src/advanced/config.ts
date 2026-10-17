export const modelOptions = {
  argon2: [64, 256, 1024],
  equihash: [64, 128, 256],
  cuckoo: [32, 64, 96],
  randomx: [8, 16, 32],
  ethash: [11699999, 11700000, 12000000],
  etchash: [11699999, 11700000, 12000000],
  primecoin: [3, 4, 5],
  kheavyhash: [4, 8],
  vdf: [128, 256, 512],
} as const;
export type AdvancedId = keyof typeof modelOptions;
