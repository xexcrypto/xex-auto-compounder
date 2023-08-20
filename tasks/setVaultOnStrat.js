const { task } = require("hardhat/config");
const helpers = require('../scripts/helpers.js')
const fs = require("fs");
// const StratABI = JSON.parse(fs.readFileSync('artifacts/contracts/_StratBase.sol/_StratBase.json') || '{}')?.abi

task("setVaultOnStrat", "* Sets the vault address of strategy")
  .addParam("stratName", "Name of strat to deploy")
  .setAction(async (_taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    // Load strat abi:
    let StratABI

    try{
      StratABI = JSON.parse(fs.readFileSync('artifacts/contracts/_StratBase.sol/_StratBase.json'))?.abi
    } catch {
      console.log('Base Strategy artifact not found')
      return
    }

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
    const addrs = data[network.chainId]

    console.log(`-> Setting vault on strategy ${conf.name} (${addrs.strat}) \n to: ${addrs.vault}`)

    // wait to allow cancel:
    console.log('waiting 5 seconds to continue')
    await new Promise((r) => setTimeout(()=>r(), 5000))
    console.log('Action!')

    // 
    const strat = new ethers.Contract(addrs.strat, StratABI)
    const signer = await ethers.getSigner()
    console.log('Signer:', signer.address)

    const tx = await strat.connect(signer).setAddress(1, addrs.vault)
    console.log(tx)
    await tx.wait()
   
    
  });