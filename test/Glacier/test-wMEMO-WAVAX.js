const base = require('./modules/vaultStratBase')

describe("wMEMO-WAVAX", base.main(
  // Contract, stratName
  'StratXX', 'wMEMO-WAVAX',
  // Want, Gauge
  '0x322F83CB72869a776B7F070b4866209354396546', '0x5758A136418Bcb35Ea4DC1FD6fbc1E7d3e9995da', 
  // Token0, Token0 Name
  '0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b', 'wMEMO', 
  // Token1, Token1 Name
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 'WAVAX',
  // Has token0, token0 Qty
  '0x31d3243cfb54b34fc9c73e1cb1137124bd6b13e1', 0.002, 
  // has token1, token1 Qty
  '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 5,
  // Path GLCR to token0:
  [
  {
    "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
    "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "stable": false
  },
  {
    "from": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    "to": "0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b",
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
