const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-WETH", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-WETH',
  // Want, Gauge
  '0x3a3f84b45f857df60360b2b007eef495576642de', '0x30d0672c6e51f3169d8d19e2eab12d0e7aa16e17', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0x695921034f0387eac4e11620ee91b1b15a6a09fe', 'WETH',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 7775.866, 
  // has token1, token1 Qty
  '0xf2610511493473379d76bfee07b673d0cb4ed3e7', 1,
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
    "to": "0x695921034f0387eac4e11620ee91b1b15a6a09fe",
    "stable": false
  }
],
  // Is stable:
  false
))
