const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-FRAX", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-FRAX',
  // Want, Gauge
  '0x84f38b4134fee2885e55e918866307d8b58c00fa', '0x3ed1465ec8a5af4f72ae76618ffa860466ef7678', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0xdc301622e621166bd8e82f2ca0a26c13ad0be355', 'FRAX',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 4.169, 
  // has token1, token1 Qty
  '0x088be716eca24b143fcc9ed06c6ae9977a469cce', 1,
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
    "to": "0xdc301622e621166bd8e82f2ca0a26c13ad0be355",
    "stable": false
  }
],
  // Is stable:
  false
))
