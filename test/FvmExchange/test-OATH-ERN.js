const base = require('./modules/fvmVaultStratBase')

describe("xF-OATH-ERN", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-OATH-ERN',
  // Want, Gauge
  '0x487079f7311e8b5159e1b1572f8faaf805ec7d1e', '0xce689647318c502ff4e1b79c1bb0daa3ac9b0c76', 
  // Token0, Token0 Name
  '0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6', 'OATH', 
  // Token1, Token1 Name
  '0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a', 'ERN',
  // Has token0, token0 Qty
  '0xea67f85a2220bbf9859c25d73685f780c7551a12', 20.453, 
  // has token1, token1 Qty
  '0x0d8cd4191b92c1eb373ae7eac3696a00748410f2', 1,
  // Path GLCR to token0:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6",
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
