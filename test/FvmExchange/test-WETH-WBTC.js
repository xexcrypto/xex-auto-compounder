const base = require('./modules/fvmVaultStratBase')

describe("xF-WETH-WBTC", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WETH-WBTC',
  // Want, Gauge
  '0x04636d31be7a53bb91e48166b2458c6c35cc7bf2', '0x3900ee825056dcd49b5ae4bdf2d16f38b764bfe7', 
  // Token0, Token0 Name
  '0x695921034f0387eac4e11620ee91b1b15a6a09fe', 'WETH', 
  // Token1, Token1 Name
  '0xf1648c50d2863f780c57849d812b4b7686031a3d', 'WBTC',
  // Has token0, token0 Qty
  '0xf2610511493473379d76bfee07b673d0cb4ed3e7', 15.998, 
  // has token1, token1 Qty
  '0x04636d31be7a53bb91e48166b2458c6c35cc7bf2', 1,
  // Path GLCR to token0:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0x695921034f0387eac4e11620ee91b1b15a6a09fe",
    "stable": false
  }
], 
  // Path GLCR to token1:
  [
  {
    "from": "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    "to": "0xf1648c50d2863f780c57849d812b4b7686031a3d",
    "stable": false
  }
],
  // Is stable:
  false
))
