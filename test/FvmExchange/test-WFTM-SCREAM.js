const base = require('./modules/fvmVaultStratBase')

describe("xF-WFTM-SCREAM", base.main(
  // Contract, stratName
  'FvmStratStd', 'xF-WFTM-SCREAM',
  // Want, Gauge
  '0xebd8bf837ec2448608e34fa450e28d79dab84b9f', '0x051ee4773f244d57934bb72b071669349141edce', 
  // Token0, Token0 Name
  '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', 'WFTM', 
  // Token1, Token1 Name
  '0xe0654c8e6fd4d733349ac7e09f6f23da256bf475', 'SCREAM',
  // Has token0, token0 Qty
  '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', 1.94, 
  // has token1, token1 Qty
  '0x63a03871141d88cb5417f18dd5b782f9c2118b5b', 1,
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
    "to": "0xe0654c8e6fd4d733349ac7e09f6f23da256bf475",
    "stable": false
  }
],
  // Is stable:
  false
))
