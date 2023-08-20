const base = require('./modules/vaultStratBase')

describe("WAVAX-EUROC", base.main(
  // Contract, stratName
  'StratXX', 'WAVAX-EUROC',
  // Want, Gauge
  '0x32A199f6F7Bf9e04c19190A9b285DdDECA29303e', '0x334f717cFC96715DEB0C57075E6157377803D902', 
  // Token0, Token0 Name
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'WAVAX', 
  // Token1, Token1 Name
  '0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD', 'EUROC',
  // Has token0, token0 Qty
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 1, 
  // has token1, token1 Qty
  '0xbf14db80d9275fb721383a77c00ae180fc40ae98', 1.1,
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
    "to": "0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD",
    "stable": false
  }
],
  // Is stable:
  false
))
