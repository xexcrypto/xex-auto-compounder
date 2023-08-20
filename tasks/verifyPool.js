const { task } = require("hardhat/config");
const helpers = require('../scripts/helpers.js')
const fs = require("fs");
// const StratABI = JSON.parse(fs.readFileSync('artifacts/contracts/_StratBase.sol/_StratBase.json')).abi

const addrs = {
  GLRouter: '0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC',
  wavax:    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  glcr:     '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6',

  strategist: '0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e',
  team:       '0x04345e22cd5781C8264A611c056DDFA8bbCddfA4', 
  xexadon:    '0x8eD98Eeb0c360d1b7C8ab5e85Dc792A1e4B18D8c', 
  user1:      '0xE604E79c771AfcE72c5D5ceeB10FEFA47221b008',
  sentinal:   '0x13571a5f94ff06b4418df229bd2fc781461cd88e',
}

task("verifyPool", "* Verify the vault and strat with Snowtrace")
  .addParam("stratName", "Name of strat to deploy")
  .setAction(async (_taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    // Load config:
    let config = JSON.parse(await helpers.getJsonFile('strategies-glacier-config.json', '{}'));

    // filter config:
    const conf = config.find(c => c.name == _taskArgs.stratName)
    if (!conf){
      console.log('Strategy not found.')
      // runAll = true
      return
    }

    // Load up the addresses:
    const network = await hre.ethers.provider.getNetwork();
    const data = JSON.parse(await helpers.getJsonFile(`contracts-${conf.name}.json`));
    const pair = data[network.chainId]

    // Verify vault:
    console.log(`Verifying vault`)

    // VERIFY THE STRATEGY \\

    // build the args:
    let constructorArgumentsStrat

    switch(conf.contract){
      case 'StratXX':{
        constructorArgumentsStrat = [
          conf.want,
          conf.gauge,
          addrs.GLRouter,
          addrs.wavax, // fee token - WAVAX
          conf.token0,
          conf.token1,
          conf.path0toX,
          conf.path1toX,
          [{ from: addrs.glcr, to: addrs.wavax, stable: false }]
        ]
        break;
      }
      case 'StratGlcrX':{
        constructorArgumentsStrat = [
          conf.want,
          conf.gauge,
          addrs.GLRouter,
          addrs.wavax, // fee token - WAVAX
          conf.tokenX,
          conf.pathToX,
          [{ from: addrs.glcr, to: addrs.wavax, stable: false }]
        ]
        break;
      }
      case 'StratXGlcr':{
        constructorArgumentsStrat = [
          conf.want,
          conf.gauge,
          addrs.GLRouter,
          addrs.wavax, // fee token - WAVAX
          conf.tokenX,
          conf.pathToX,
          [{ from: addrs.glcr, to: addrs.wavax, stable: false }]
        ]
        break;
      }
    }

    // Verify strategy:
    await hre.run('verify:verify', {
      address: pair.strat,
      constructorArguments: constructorArgumentsStrat
    })

    // VERIFY THE VAULT \\
    await hre.run('verify:verify', {
      address: pair.vault,
      constructorArguments: [
        pair.strat,
        // string memory _name:
        `xG-${conf.name}`,
        // string memory _symbol:
        `xG-${conf.name}`
      ]
    })

    // console.log(`-> Setting vault on strategy ${conf.name} (${addrs.strat}) \n to: ${addrs.vault}`)

    // // wait to allow cancel:
    // console.log('waiting 5 seconds to continue')
    // await new Promise((r) => setTimeout(()=>r(), 5000))
    // console.log('Action!')

    // // 
    // const strat = new ethers.Contract(addrs.strat, StratABI)
    // const signer = await ethers.getSigner()
    // console.log('Signer:', signer.address)

    // const tx = await strat.connect(signer).setAddress(1, addrs.vault)
    // console.log(tx)
    // await tx.wait()
   
    
  });