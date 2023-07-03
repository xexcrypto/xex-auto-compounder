const base = require('./modules/vaultStratBase')

describe("GRAIN-WAVAX", base.main(
  // Contract, stratName
  'StratXX', 'GRAIN-WAVAX',
  // Want, Gauge
  '0x21F1d5460cC69326d6554366F4c8F61B4D40aba4', '0x0E9b2032338bDaE350BE68e74D5276Ebebe4f552', 
  // Token0, Token0 Name
  '0x9df4Ac62F9E435DbCD85E06c990a7f0ea32739a9', 'GRAIN', 
  // Token1, Token1 Name
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'WAVAX',
  // Has token0, token0 Qty
  '0x656f946f413c08634fa489b4b40e09350daaa930', 550, 
  // has token1, token1 Qty
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 1,
  // Path GLCR to token0:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  },
  {
    "from": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "to": "0x9df4Ac62F9E435DbCD85E06c990a7f0ea32739a9",
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
