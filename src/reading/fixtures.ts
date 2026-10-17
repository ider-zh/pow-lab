// Reproducible SHA-256 samples; independently checked in reading.test.ts.
export const searchSample = {
  kind: "hashcash",
  challenge: "hello-pow",
  difficulty: 1,
  attempts: [
    {
      nonce: 0,
      hash: "7210fe1926d98332ad593d6671a9e1c6f14c8916143fa72ded90ee3d57b8fc4f",
      hit: false,
    },
    {
      nonce: 1,
      hash: "e233e001f03cb83bfdf368304e1fc8be5bb5a6af66edebc5f3cfaf1ef1f4119b",
      hit: false,
    },
    {
      nonce: 2,
      hash: "11f4a2c5cb04fbb624eb997998e7c28a40e60e4e217fff35a287180890095b19",
      hit: false,
    },
    {
      nonce: 3,
      hash: "73bc6bce0d4b422d7ed3e66e8ccad0d9dd798781612e8b92c75ff08d98151309",
      hit: false,
    },
    {
      nonce: 4,
      hash: "62a4a840b9ba0e51e04b5eb9439b0c781f6734b204f53e025a1fd0f87222bd0c",
      hit: false,
    },
    {
      nonce: 5,
      hash: "8840b30f9fa44d5607cae667ecbc5c65576381ddd00da4adf3c90775ae2880e1",
      hit: false,
    },
    {
      nonce: 6,
      hash: "a36af3a5db4a13edafa823710a10cb49d1d8069bb947053d83ca65b13f7ec83f",
      hit: false,
    },
    {
      nonce: 7,
      hash: "9769cc9045ff38b5288c871121a1138334ebef316297fb1262608464cf893446",
      hit: false,
    },
    {
      nonce: 8,
      hash: "c96745f86d44df49275b45810a08c48b4c9e0e5d12f602922e03623a0c5ad881",
      hit: false,
    },
    {
      nonce: 9,
      hash: "51b8be688ba43bac882889f6843c7f2376ed224b609f60aa08843410634c27ed",
      hit: false,
    },
    {
      nonce: 10,
      hash: "d341ecc00d23ab2eb9d2a892bdb94ad3ef7a9383f03cee91e0820b6b74c38523",
      hit: false,
    },
    {
      nonce: 11,
      hash: "9f1f63c391ab04e4ee2e40f2132c34f2a2c7708fbe2a589d76d70a6024557815",
      hit: false,
    },
    {
      nonce: 12,
      hash: "448a95ec34495cf29f01107a7e823993556bd543e0752a5f120b29fd5726f378",
      hit: false,
    },
    {
      nonce: 13,
      hash: "f5622a8924031dbb0079b5936fd85569bb54d1013204aefc2f31796b6a35c4b6",
      hit: false,
    },
    {
      nonce: 14,
      hash: "a288858c24093c28f406cea3d4e99413d9e34d17e73d9bf2c5b4dc537f07e04e",
      hit: false,
    },
    {
      nonce: 15,
      hash: "946588feb0f0d5e0ddb8d73c04f1e5d7c94bb1834a721ce8c096fc39bc66a89a",
      hit: false,
    },
    {
      nonce: 16,
      hash: "7e73ed90167d9060f5c5eb2723f28cb75a62d185d5f8caf308c10d24d6bec74c",
      hit: false,
    },
    {
      nonce: 17,
      hash: "cdc57cb861c0efa7181b9e90fca415a1a99a68cae85fdadc6d921a0cb2b1dbef",
      hit: false,
    },
    {
      nonce: 18,
      hash: "081014f131fdff87b95904fa233faea65f7a186e5054a577d35af7941e18ccd5",
      hit: true,
    },
  ],
  verifiedHash:
    "081014f131fdff87b95904fa233faea65f7a186e5054a577d35af7941e18ccd5",
} as const;
export const doubleSample = {
  kind: "sha256d",
  original: {
    input: "hello-pow:0",
    first: "7210fe1926d98332ad593d6671a9e1c6f14c8916143fa72ded90ee3d57b8fc4f",
    second: "12d44a298e49fe7e71f48ce66164dd2cc1310b85576d12fcbb51c4968235d9db",
  },
  changed: {
    input: "hello-pow:1",
    first: "e233e001f03cb83bfdf368304e1fc8be5bb5a6af66edebc5f3cfaf1ef1f4119b",
    second: "0c9cd4ab22f76eaf3cb545cb16138456cdb18b74e951fdfd135e35370cf25e60",
  },
  firstFlips: 127,
  secondFlips: 125,
} as const;
