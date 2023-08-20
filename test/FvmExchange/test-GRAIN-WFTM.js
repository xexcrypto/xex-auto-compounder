const base = require('./modules/fvmVaultStratBase')

describe("xF-GRAIN-WFTM", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-GRAIN-WFTM',
  // Want, Gauge
  '0xb6220893efc07f942972d266ab8f8867995d2278', '0xbb538abc3a584073396e4058152d1b1c67592b3d', 
  // Token0, Token0 Name
  '0x02838746d9e1413e07ee064fcbada57055417f21', 'GRAIN', 
  // Token1, Token1 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM',
  // Has token0, token0 Qty
  '0x99f7f1a1dd30457dfad312b4064fa4ad4b73b2d7', 17.65, 
  // has token1, token1 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1,
  // Path GLCR to token0:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x02838746d9e1413e07ee064fcbada57055417f21",
    "stable": false
  }
], 
  // Path GLCR to token1:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
    "stable": false
  }
],
  // Is stable:
  false
))
