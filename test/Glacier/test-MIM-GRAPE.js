const base = require('./modules/vaultStratBase')

describe("MIM-GRAPE", base.main(
  // Contract, stratName
  'StratXXm', 'MIM-GRAPE',
  // Want, Gauge
  '0x9A6e6CA75FF2Fd0b70027Bbe844f5Afa612Dd773', '0x450b3912937813f12a5B3960fdc2BBE995CeA33b', 
  // Token0, Token0 Name
  '0x130966628846BFd36ff31a822705796e8cb8C18D', 'MIM', 
  // Token1, Token1 Name
  '0x5541D83EFaD1f281571B343977648B75d95cdAC2', 'GRAPE',
  // Has token0, token0 Qty
  '0xae64a325027c3c14cf6abc7818aa3b9c07f5c799', 100, 
  // has token1, token1 Qty
  '0xb382247667fe8ca5327ca1fa4835ae77a9907bc8', 6320,
  // Path GLCR to token0:
  [
  {
    "router": "0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC",
    "paths": [
      {
        "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
        "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        "stable": false
      }
    ],
    "pathsSimple": []
  },
  {
    "router": "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    "paths": [],
    "pathsSimple": [
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      "0x130966628846BFd36ff31a822705796e8cb8C18D"
    ]
  }
], 
  // Path GLCR to token1:
  [
  {
    "router": "0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC",
    "paths": [
      {
        "from": "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6",
        "to": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        "stable": false
      }
    ],
    "pathsSimple": []
  },
  {
    "router": "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    "paths": [],
    "pathsSimple": [
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      "0x130966628846BFd36ff31a822705796e8cb8C18D",
      "0x5541D83EFaD1f281571B343977648B75d95cdAC2"
    ]
  }
],
  // Is stable:
  false
))
