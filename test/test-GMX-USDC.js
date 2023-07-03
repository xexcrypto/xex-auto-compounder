const base = require('./modules/vaultStratBase')

describe("GMX-USDC", base.main(
  // Contract, stratName
  'StratXX', 'GMX-USDC',
  // Want, Gauge
  '0x32E3f290cD0dBE930fa286f0C2a9a958B3A03e30', '0xC0d0b21bfF732eCE3aD7f8502B58741EdB48D4D4', 
  // Token0, Token0 Name
  '0x62edc0692BD897D2295872a9FFCac5425011c661', 'GMX', 
  // Token1, Token1 Name
  '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 'USDC',
  // Has token0, token0 Qty
  '0x4aefa39caeadd662ae31ab0ce7c8c2c9c0a013e8', 1, 
  // has token1, token1 Qty
  '0x3c0ecf5f430bbe6b16a8911cb25d898ef20805cf', 53,
  // Path GLCR to token0:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  },
  {
    "from": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "to": "0x62edc0692BD897D2295872a9FFCac5425011c661",
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
    "to": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    "stable": false
  }
],
  // Is stable:
  false
))
