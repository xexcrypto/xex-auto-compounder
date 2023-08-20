const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-TAROT", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-TAROT',
  // Want, Gauge
  '0xe27ebdd7137a4b93f9d3a3bdb6e5aefe77e310b2', '0xe0e136f218d89111ec81ae5bf89659c59e7a1f19', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0xc5e2b037d30a390e62180970b3aa4e91868764cd', 'TAROT',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1, 
  // has token1, token1 Qty
  '0xb0fdcdd7e920a036331abe9ffc7313322c0abba0', 4.3,
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
    "to": "0xc5e2b037d30a390e62180970b3aa4e91868764cd",
    "stable": false
  }
],
  // Is stable:
  false
))
