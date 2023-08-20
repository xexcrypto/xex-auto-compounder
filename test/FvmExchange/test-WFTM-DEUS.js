const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-DEUS", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-DEUS',
  // Want, Gauge
  '0x74975f880d6df7ad4dd4c0016d49dbe9cf9d65e0', '0x95c442dcc50ea5bc3b67b85a8b238658301ad0d1', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0xde5ed76e7c05ec5e4572cfc88d1acea165109e44', 'DEUS',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 106.19, 
  // has token1, token1 Qty
  '0x0153bf855fe4c5dd5acaf49c49a4a6625f071d93', 1,
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
    "to": "0xde5ed76e7c05ec5e4572cfc88d1acea165109e44",
    "stable": false
  }
],
  // Is stable:
  false
))
