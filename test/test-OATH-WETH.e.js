const base = require('./modules/vaultStratBase')

describe("OATH-WETH.e", base.main(
  // Contract, stratName
  'StratXX', 'OATH-WETH.e',
  // Want, Gauge
  '0xE2E6b65119576FdD56ED12Caec22Acdf89c20581', '0xEb51DE0A028f01e39A4718eFCBafb6a694209a57', 
  // Token0, Token0 Name
  '0x2c69095d81305F1e3c6ed372336D407231624CEa', 'OATH', 
  // Token1, Token1 Name
  '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 'WETH.e',
  // Has token0, token0 Qty
  '0x4ea0708264b5419f16511ed2a1c46b0c55f38d1a', 12.21, 
  // has token1, token1 Qty
  '0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21', 0.1,
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
  },
  {
    "from": "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    "to": "0x2c69095d81305F1e3c6ed372336D407231624CEa",
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
  },
  {
    "from": "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    "to": "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    "stable": false
  }
],
  // Is stable:
  false
))
