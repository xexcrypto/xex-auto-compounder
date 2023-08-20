const base = require('./modules/fvmVaultStratBase')

describe("xF-GRAIN-ERN", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-GRAIN-ERN',
  // Want, Gauge
  '0xf7b112a42b2f68ce85e5f19ddc849327212d8132', '0x39e18682f0e988f667e18f193fb525fc2532f854', 
  // Token0, Token0 Name
  '0x02838746d9e1413e07ee064fcbada57055417f21', 'GRAIN', 
  // Token1, Token1 Name
  '0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a', 'ERN',
  // Has token0, token0 Qty
  '0x99f7f1a1dd30457dfad312b4064fa4ad4b73b2d7', 75.695, 
  // has token1, token1 Qty
  '0x0d8cd4191b92c1eb373ae7eac3696a00748410f2', 1,
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
    "to": "0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf",
    "stable": false
  },
  {
    "from": "0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf",
    "to": "0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a",
    "stable": true
  }
],
  // Is stable:
  false
))
