const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-frxETH", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-frxETH',
  // Want, Gauge
  '0x4436928aab91102314afa9cc71242710ac37eb2c', '0x67b563199e1a794a2d96fde72e0f05ed70e63de0', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0x9e73f99ee061c8807f69f9c6ccc44ea3d8c373ee', 'frxETH',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 7735.483, 
  // has token1, token1 Qty
  '0x9e6f4ea5c799253eca001ac159646c36ae607f41', 1,
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
    "to": "0x9e73f99ee061c8807f69f9c6ccc44ea3d8c373ee",
    "stable": false
  }
],
  // Is stable:
  false
))
