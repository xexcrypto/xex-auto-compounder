const base = require('./modules/vaultStratBase')

describe("GLCR-fBOMB", base.main(
  // Contract, stratName
  'StratGlcrX', 'GLCR-fBOMB',
  // Want, Gauge
  '0xf9728ccE66d4128e76C86D9bBaC08fC2F3641A05', '0x642eb8CD5E96cc39d27954b22A1745Db5C153b98', 
  // Token0, Token0 Name
  '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', 'GLCR', 
  // Token1, Token1 Name
  '0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce', 'fBOMB',
  // Has token0, token0 Qty
  '0xa38038ec009995fb11f09ab60410dcf0350c315c', 10, 
  // has token1, token1 Qty
  '0x28aa4f9ffe21365473b64c161b566c3cdead0108', 10,
  // Path GLCR to token0:
  "", 
  // Path GLCR to token1:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce",
    "stable": false
  }
],
  // Is stable:
  false
))
