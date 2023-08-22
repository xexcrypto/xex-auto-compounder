const base = require('./modules/vaultStratBase')

describe("MIM-WINE", base.main(
  // Contract, stratName
  'StratXXm', 'MIM-WINE',
  // Want, Gauge
  '0x5C253047878caB70D6d3C56C867e54EEEa9cfe5b', '0x448c3Ac0dd9aCF91F17455B7F285E7f58b3491d8', 
  // Token0, Token0 Name
  '0x130966628846BFd36ff31a822705796e8cb8C18D', 'MIM', 
  // Token1, Token1 Name
  '0xC55036B5348CfB45a932481744645985010d3A44', 'WINE',
  // Has token0, token0 Qty
  '0xae64a325027c3c14cf6abc7818aa3b9c07f5c799', 10, 
  // has token1, token1 Qty
  '0x00cb5b42684da62909665d8151ff80d1567722c3', 11,
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
      "0xC55036B5348CfB45a932481744645985010d3A44"
    ]
  }
],
  // Is stable:
  false
))
