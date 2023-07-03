const base = require('./modules/vaultStratBase')

describe("WETH.e-USDT.e", base.main(
  // Contract, stratName
  'StratXX', 'WETH.e-USDT.e',
  // Want, Gauge
  '0x0717C121D012e46a429a488eBA1DB22AD1051FDd', '0x2E0D32C5D98e0007C95eeD54d450d2E8155EDf48', 
  // Token0, Token0 Name
  '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 'WETH.e', 
  // Token1, Token1 Name
  '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', 'USDT.e',
  // Has token0, token0 Qty
  '0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21', 1, 
  // has token1, token1 Qty
  '0xed2a7edd7413021d440b09d654f3b87712abab66', 1860,
  // Path GLCR to token0:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  },
  {
    "from": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "to": "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    "stable": false
  },
  {
    "from": "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    "to": "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    "stable": false
  }
], 
  // Path GLCR to token1:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  },
  {
    "from": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "to": "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    "stable": false
  }
],
  // Is stable:
  false
))
