const base = require('./modules/fvmVaultStratBase')

describe("xF-FVM-WFTM", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-FVM-WFTM',
  // Want, Gauge
  '0x0e8f117a563be78eb5a391a066d0d43dd187a9e0', '0xa3643a5d5b672a267199227cd3e95ed0b41dbd52', 
  // Token0, Token0 Name
  '0x07bb65faac502d4996532f834a1b7ba5dc32ff96', 'FVM', 
  // Token1, Token1 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM',
  // Has token0, token0 Qty
  '0xae459ee7377fb9f67518047bba5482c2f0963236', 1, 
  // has token1, token1 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1.963,
  // Path GLCR to token0:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x07bb65faac502d4996532f834a1b7ba5dc32ff96",
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
