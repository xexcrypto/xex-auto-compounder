const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-USDC", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-USDC',
  // Want, Gauge
  '0x1a35c7357bc8d0eb9342d73d4f13c4a6f64ac1d6', '0x78751a5577fb9875accede0965691d46960c1216', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0x28a92dde19d9989f39a49905d7c9c2fac7799bdf', 'USDC',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 4.166, 
  // has token1, token1 Qty
  '0xc647ce76ec30033aa319d472ae9f4462068f2ad7', 1,
  // Path GLCR to token0:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "stable": false
  }
], 
  // Path GLCR to token1:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x28a92dde19d9989f39a49905d7c9c2fac7799bdf",
    "stable": false
  }
],
  // Is stable:
  false
))
