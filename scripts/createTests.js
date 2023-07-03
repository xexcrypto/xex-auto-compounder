// const { task } = require("hardhat/config");
// const { run } = require("hardhat");
const fs = require("fs");
const helpers = require('../scripts/helpers.js')


const HAS_TOKEN = {
  'WETH.e':   '0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21',  // 0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB
  'USDT.e':   '0xed2a7edd7413021d440b09d654f3b87712abab66',  // 0xc7198437980c041c805A1EDcbA50c1Ce5db95118
  'BTC.b':    '0x0fd6f65d35cf13ae51795036d0ae9af42f3cbcb4',  // 0x152b9d0FdC40C096757F570A51E494bd4b943E50
  'WAVAX':    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',  // 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7
  'GLCR':     '0xa38038ec009995fb11f09ab60410dcf0350c315c',  // 0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6
  'GRAIN':    '0x656f946f413c08634fa489b4b40e09350daaa930',  // 0x9df4Ac62F9E435DbCD85E06c990a7f0ea32739a9
  'wMEMO':    '0x31d3243cfb54b34fc9c73e1cb1137124bd6b13e1',  // 0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b
  'EUROC':    '0xbf14db80d9275fb721383a77c00ae180fc40ae98',  // 0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD
  'GMX':      '0x4aefa39caeadd662ae31ab0ce7c8c2c9c0a013e8',  // 0x62edc0692BD897D2295872a9FFCac5425011c661
  'USDC':     '0x3c0ecf5f430bbe6b16a8911cb25d898ef20805cf',  // 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
  'ANKR':     '0x535492c872f3ae11c73a0a97f5f069715bb2d505',  // 0x20CF1b6E9d856321ed4686877CF4538F2C84B4dE
  'ankrAVAX': '0x542dd5f38fcb3aab28d6418cf3e1d36329a79ac7',  // 0xc3344870d52688874b06d844E0C36cc39FC727F6
  'ankrETH':  '0xa63e0c77d92d9ee15bbeb0c219d80748605b2cf6',  // 0x12D8CE035c5DE3Ce39B1fDD4C1d5a745EAbA3b8C
  'DEUS':     '0x83b285e802d76055169b1c5e3bf21702b85b89cb',  // 0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44
  'OATH':     '0x4ea0708264b5419f16511ed2a1c46b0c55f38d1a',  // 0x2c69095d81305F1e3c6ed372336D407231624CEa
  'xSHRAP':   '0xf63b2921403817e9c02cf47bd2b9dd183568f02c',  // 0x1e3c6c53F9f60BF8aAe0D7774C21Fa6b1afddC57
  'YAK':      '0x0cf605484a512d3f3435fed77ab5ddc0525daf5f',  // 0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7
  'DEI':      '0x37ac09e1640577e1d71e3787297a56b58f88f0f2',  // 0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0
  'fBOMB':    '0x28aa4f9ffe21365473b64c161b566c3cdead0108',  // 0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce
}
const TOKEN_AMOUNTS = {
  'WETH.e-USDT.e': { q0:1, q1:1860},
  'BTC.b-WAVAX': { q0:0.001, q1:2.4},
  'GLCR-WAVAX': { q0:3300, q1:1},
  'GRAIN-WAVAX': { q0:550, q1:1},
  'wMEMO-WAVAX': { q0:0.002, q1:5},
  'WAVAX-EUROC': { q0:1, q1:1.1},
  'GMX-USDC': { q0:1, q1:53},
  'ANKR-ankrAVAX': { q0:2, q1:5},
  'ankrETH-ankrAVAX': { q0:0.07, q1:1},
  'WAVAX-USDT.e': { q0:1, q1:13.2},
  'WAVAX-DEUS': { q0:1, q1:2},
  'OATH-WETH.e': { q0:12.21, q1:0.1},
  'xSHRAP-WETH.e': { q0:100, q1:2.5},
  'YAK-WAVAX': { q0:10, q1:0.7},
  'USDC-DEI': { q0:10, q1:2.8},
  'GLCR-fBOMB': { q0:10, q1:10},
}
const IS_STABLE = [
  'USDC-DEI'
]
const disabled = [
  'ANKR-ankrAVAX',    // no liq when swapping for path
  'ankrETH-ankrAVAX', // Cannot get routes to fulfil swaps
  // 'GLCR-fBOMB', // Cannot deploy contract error
  // 'GLCR-WAVAX', // Cannot deploy contract error
  'USDC-DEI', // Cannot get any DEI <-- RUGGED, excluded
  'WAVAX-DEUS', // owns DEI
  'xSHRAP-WETH.e',  // no liq when swapping for path
]


async function main() {
  // generates test fixtures for all pools \\

  // Load config:
  let config = JSON.parse(await helpers.getJsonFile('strategies-config.json', '{}'));
  let template = await fs.promises.readFile('templates/Test.txt')

  const jobs = config //.filter(c => runAll || c.name == taskArguments.stratName)

  for await(const conf of jobs){
    // if disabled, remove the trest file:
    if (disabled.includes(conf.name)){
      // remove test file:
      try{ fs.unlinkSync(`test/test-${conf.name}.js`) }catch(e){}
      continue;
    }

    // Which token is which:
    let token0
    let token0name = conf.name.split('-')[0]
    let token0Qty = TOKEN_AMOUNTS[conf.name].q0
    let token1
    let token1name = conf.name.split('-')[1]
    let token1Qty = TOKEN_AMOUNTS[conf.name].q1

    let token0Path = ''
    let token1Path = ''

    // let ratio = conf.price0 / (conf.price1 == 0 ? 1 : conf.price1)

    switch(conf.contract){
      case 'StratXX':{
        token0 = conf.token0
        token1 = conf.token1
        // ratio = conf.price0 / (conf.price1 == 0 ? 1 : conf.price1)
        // token0Qty = conf.price0
        // token1Qty = ratio
        token0Path = conf.path0toX
        token1Path = conf.path1toX
        break;
      }
      case 'StratGlcrX':{
        token0 = '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6'
        token1 = conf.tokenX
        token1Path = conf.pathToX
        break;
      }
      case 'StratXGlcr':{
        token0 = conf.tokenX
        token1 = '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6'
        token0Path = conf.pathToX
        break;
      }
    }

    // Generate the text:
    let tmpl = template.toString().replace('$TOKEN_NAME', conf.name)
    tmpl = tmpl.replace('$CONTRACT', conf.contract)
    tmpl = tmpl.replace('$STRATNAME', conf.name)
    
    tmpl = tmpl.replace('$WANT', conf.want)
    tmpl = tmpl.replace('$GAUGE', conf.gauge)

    tmpl = tmpl.replace('$TOKEN0', token0)
    tmpl = tmpl.replace('$TOKEN0_NAME', token0name)
    tmpl = tmpl.replace('$TOKEN0QTY', token0Qty)
    
    tmpl = tmpl.replace('$TOKEN1', token1)
    tmpl = tmpl.replace('$TOKEN1_NAME', token1name)
    tmpl = tmpl.replace('$TOKEN1QTY', token1Qty)

    tmpl = tmpl.replace('$HASTOKEN0', HAS_TOKEN[token0name])
    tmpl = tmpl.replace('$HASTOKEN1', HAS_TOKEN[token1name])

    tmpl = tmpl.replace('$PATH0TOX', JSON.stringify(token0Path, undefined, '  '))
    tmpl = tmpl.replace('$PATH1TOX', JSON.stringify(token1Path, undefined, '  '))

    tmpl = tmpl.replace('$ISSTABLE', IS_STABLE.includes(conf.name))
    


    // save test file:
    await fs.promises.writeFile(`test/test-${conf.name}.js`, tmpl)

  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});