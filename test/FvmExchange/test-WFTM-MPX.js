const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-MPX", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-MPX',
  // Want, Gauge
  '0xf8eed2665fd11a8431fc41b2582fd5e72a1606f0', '0xf89f367e0225fe68c7c28fad0badc7f569987cfe', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0x66eed5ff1701e6ed8470dc391f05e27b1d0657eb', 'MPX',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1, 
  // has token1, token1 Qty
  '0xdd257d090fa0f9ffb496b790844418593e969ba6', 2.868,
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
    "to": "0x66eed5ff1701e6ed8470dc391f05e27b1d0657eb",
    "stable": false
  }
],
  // Is stable:
  false
))
