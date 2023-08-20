const base = require('./modules/fvmVaultStratBase')

describe("xF-LQDR-WFTM", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-LQDR-WFTM',
  // Want, Gauge
  '0x27670eaca9eaff46fc03d6323924932bab2237e3', '0x8644f6258de46b1498bd904b0a3496ea5458bcc4', 
  // Token0, Token0 Name
  '0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9', 'LQDR', 
  // Token1, Token1 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM',
  // Has token0, token0 Qty
  '0x3ae658656d1c526144db371faef2fff7170654ee', 1, 
  // has token1, token1 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1.656,
  // Path GLCR to token0:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9",
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
