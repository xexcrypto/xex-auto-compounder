const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-sFTMX", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-sFTMX',
  // Want, Gauge
  '0xac8909fb68c33ffbf977e55b07b5fe85552ef97d', '0x7f244daa7ae845a20d621d876896530b58d0a681', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0xd7028092c830b5c8fce061af2e593413ebbc1fc1', 'sFTMX',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1.088, 
  // has token1, token1 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1,
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
    "to": "0xd7028092c830b5c8fce061af2e593413ebbc1fc1",
    "stable": false
  }
],
  // Is stable:
  false
))
