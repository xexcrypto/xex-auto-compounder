const base = require('./modules/vaultStratBase')

describe("YAK-WAVAX", base.main(
  // Contract, stratName
  'StratXX', 'YAK-WAVAX',
  // Want, Gauge
  '0xa13403733dB5C101490436CfFF012F6ac93A6097', '0xe68B719EDb685D63C58a133005f0fb307Eb5F289', 
  // Token0, Token0 Name
  '0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7', 'YAK', 
  // Token1, Token1 Name
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'WAVAX',
  // Has token0, token0 Qty
  '0x0cf605484a512d3f3435fed77ab5ddc0525daf5f', 10, 
  // has token1, token1 Qty
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 0.7,
  // Path GLCR to token0:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  },
  {
    "from": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "to": "0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7",
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
