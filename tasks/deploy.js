const { task } = require("hardhat/config");
// const { run } = require("hardhat");
const fs = require("fs");
const helpers = require('../scripts/helpers.js')


task("deploy", "* Deploy a strategy and vault")
  .addOptionalParam("stratName", "Name of strat to deploy")
  .addOptionalParam("deployAll", "True to deploy all", false, types.boolean)
  .addOptionalParam("isTest", "True for test mode", true, types.boolean)
  .setAction(async function (taskArguments, hre) {
    console.log(taskArguments)

    let runAll = false;

    if (taskArguments.isTest)
      console.log('== TEST MODE ==')

    // Load config:
    let config = JSON.parse(await helpers.getJsonFile('strategies-glacier-config.json', '{}'));

    if (!taskArguments.deployAll){
      // filter config:
      const cont = config.find(c => c.name == taskArguments.stratName)
      if (!cont){
        console.log('Strategy not found, deploying all.')
        // runAll = true
        return
      }
    } else {
      runAll = true
    }

    // console.log(conf)

    // Compile first
    await run("compile")
    
    const jobs = config.filter(c => runAll || c.name == taskArguments.stratName)

    for await(const conf of jobs){
      // Load up for the deploy:
      const contracts = await deployer(
        conf,
        // conf.contract, 
        // conf.name, 
        // conf.want, 
        // conf.gauge, 
        // conf.path,
        // conf.tokenX
        taskArguments.isTest,
      )

      // console.log(contracts)

      const network = await hre.ethers.provider.getNetwork();
      const contractFileName = `contracts-${conf.name}.json`
      let deployments = JSON.parse(await helpers.getJsonFile(contractFileName, '{}'));

      // Save deployment info:
      deployments[taskArguments.isTest ? 'test' : network.chainId] = {
        // ...deployments[network.chainId],
        vault: contracts.vault.address,
        strat: contracts.strat.address,
      }
      console.log('DEPLOY INFO', deployments)
      
      // if (!isTest)
      await helpers.saveJsonFile(contractFileName, deployments)
    }

  })




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
  
  const deployer = async (
    conf,
    // stratName,
    // tokenName,
    // want, gauge,
    // pathGlcrToTokenX,
    // tokenX
    isTest,
  ) => {
    let strat;
    let vault;

    const { name:tokenName, contract:stratName, want, gauge } = conf
  
    // console.log('Deploying strategy with these options:', [
    //   want,
    //   gauge,
    //   addrs.GLRouter,
    //   addrs.wavax, // WAVAX
    //   tokenX,
    //   [{ from: addrs.glcr, to: addrs.wavax, stable: false }],
    //   pathGlcrToTokenX,
    //   [{ from: addrs.glcr, to: addrs.wavax, stable: false }]
    // ])
    
    console.log('Strat name:', stratName)
    console.log('Token name:', tokenName)
  
  
    /****************************************************
     * Deploy Strategy:
     ****************************************************/
    const Strategy = await hre.ethers.getContractFactory(stratName);
    let feeData = await hre.ethers.provider.getFeeData()

    // console.log(feeData.maxFeePerGas)
    // console.log( (feeData.maxFeePerGas*50) / 100)
    // process.exit(0)

    const accounts = await hre.ethers.getSigners();

    console.log('Strategist:', accounts[0].address, "\n")

    // process.exit(0)
    
    // let nonce = await ethers.provider.getTransactionCount(accounts[0].address)
    // console.log('nonce', nonce)

    const skipStrat = false // false to not skip deploying strategy!

    if (skipStrat) {
      console.log(' -> SKIPPING STRAT DEPLOYMENT')
      strat = {
        address: '0xe1f7DA9a70538A8e575035293A597b241eD18Bc1',
        hash: ''
      }

    } else {

      switch(stratName){
        case 'StratXX':{
          console.log('Deploy args:', 
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            conf.token0,
            conf.token1,
            conf.path0toX,
            conf.path1toX,
          )
          
          strat = await Strategy.deploy(
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            conf.token0,
            conf.token1,
            conf.path0toX,
            conf.path1toX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]  // <-- Fee token path (glcr to wavax)
          , { 
            // gasLimit: 15000000,
            // gasPrice: (feeData.gasPrice*101) / 100,
            maxFeePerGas: (feeData.maxFeePerGas*50) / 100
          });

          break;
        }

        case 'StratGlcrX':{
          console.log('Deploy args:', 
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            conf.tokenX,
            conf.pathToX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]  // <-- Fee token path (glcr to wavax)
          )
          
          strat = await Strategy.deploy(
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            conf.tokenX,
            conf.pathToX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]  // <-- Fee token path (glcr to wavax)
          , { 
            // gasLimit: 15000000,
            // gasPrice: (feeData.gasPrice*101) / 100,
            // nonce: nonce+1
            maxFeePerGas: (feeData.maxFeePerGas*50) / 100
          });
          break;
        }

        case 'StratXGlcr':{
          console.log('Deploy args:', 
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            conf.tokenX,
            conf.pathToX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]  // <-- Fee token path (glcr to wavax)
          )

          strat = await Strategy.deploy(
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            conf.tokenX,
            conf.pathToX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]  // <-- Fee token path (glcr to wavax)
          , { 
            // gasLimit: 15000000,
            // gasPrice: (feeData.gasPrice*101) / 100,
            // nonce: nonce+1
            maxFeePerGas: (feeData.maxFeePerGas*50) / 100
          });
          break;
        }
      }

      console.log(`Strategy: ${strat.address}`)
      console.log(' deploy: ', strat.deployTransaction.hash)
      await strat.deployed();
    
      console.log('Strategy waiting for commitment')
      if (!isTest)
        await strat.deployTransaction.wait(2);
    }
  
  
    /****************************************************
     * Deploy Vault:
     ****************************************************/
    const VaultV2 = await hre.ethers.getContractFactory("Vault");
    feeData = await hre.ethers.provider.getFeeData()
    // nonce = await ethers.provider.getTransactionCount(accounts[0].address)
  
    vault = await VaultV2.deploy(
      // IGlacierStrat _strategy:
      strat.address,
      // string memory _name:
      `xG-${tokenName}`,
      // string memory _symbol:
      `xG-${tokenName}`
    , { 
      maxFeePerGas: (feeData.maxFeePerGas*50) / 100
      // gasLimit: 15000000,
      // gasPrice: (feeData.gasPrice*101) / 100,
      // nonce: nonce+1
    });
  
    console.log(`Vault: ${vault.address}`)
    console.log(' deploy: ', vault.deployTransaction.hash)
    await vault.deployed();
  
    console.log('Vault waiting for commitment')
    if (!isTest)
      await vault.deployTransaction.wait(2);

    
    /****************************************************
     * Update vault on strategy:
     ****************************************************/
    // if (!skipStrat) {
      let tx = await strat.setAddress(1, vault.address)
      await tx.wait()
    // }
  
    return {
      strat,
      vault
    }
  }