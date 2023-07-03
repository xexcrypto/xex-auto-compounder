const base = require('./modules/vaultStratBase')

describe("GLCR-WAVAX", base.main(
  // Contract, stratName
  'StratGlcrX', 'GLCR-WAVAX',
  // Want, Gauge
  '0x2071A39DA7450d68e4F4902774203DF208860Da2', '0xB8ef1Caf4a1A0c3D69724657b179c8836da1737d', 
  // Token0, Token0 Name
  '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', 'GLCR', 
  // Token1, Token1 Name
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'WAVAX',
  // Has token0, token0 Qty
  '0xa38038ec009995fb11f09ab60410dcf0350c315c', 3300, 
  // has token1, token1 Qty
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 1,
  // Path GLCR to token0:
  "", 
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
