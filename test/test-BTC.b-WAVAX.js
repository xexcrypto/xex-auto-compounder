const base = require('./modules/vaultStratBase')

describe("BTC.b-WAVAX", base.main(
  // Contract, stratName
  'StratXX', 'BTC.b-WAVAX',
  // Want, Gauge
  '0x18947bF710e9DDdEa8f7c33e2C9b93a6482be6A2', '0xa4c42A2C93AbDbE9CEa8B40008967D66A7e23EB0', 
  // Token0, Token0 Name
  '0x152b9d0FdC40C096757F570A51E494bd4b943E50', 'BTC.b', 
  // Token1, Token1 Name
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'WAVAX',
  // Has token0, token0 Qty
  '0x0fd6f65d35cf13ae51795036d0ae9af42f3cbcb4', 0.001, 
  // has token1, token1 Qty
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 2.4,
  // Path GLCR to token0:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  },
  {
    "from": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "to": "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    "stable": false
  }
], 
  // Path GLCR to token1:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  }
],
  // Is stable:
  false
))
