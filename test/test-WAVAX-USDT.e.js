const base = require('./modules/vaultStratBase')

describe("WAVAX-USDT.e", base.main(
  // Contract, stratName
  'StratXX', 'WAVAX-USDT.e',
  // Want, Gauge
  '0x5A5df1A7d9A35188243115dd9b6cE3B59B7f3A46', '0xD9c41a9EC8c9136ff7748059DAB1537d3D1E2Fc1', 
  // Token0, Token0 Name
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'WAVAX', 
  // Token1, Token1 Name
  '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', 'USDT.e',
  // Has token0, token0 Qty
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 1, 
  // has token1, token1 Qty
  '0xed2a7edd7413021d440b09d654f3b87712abab66', 13.2,
  // Path GLCR to token0:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
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
