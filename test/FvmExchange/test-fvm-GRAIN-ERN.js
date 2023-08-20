const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// const PURSEABI = require('../artifacts/contracts/Purse.sol/Purse.json').abi
const ERC20ABI = require('../abi/ERC20.json');
const ROUTERABI = require('./abi/FVMRouterABI.json')
const GAUGEABI = require('./abi/FVMGaugeABI.json')
const LPPAIRABI = require('./abi/LPPair.json')

const addrs = {
  strategist: '0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e',
  user1:      '0xE604E79c771AfcE72c5D5ceeB10FEFA47221b008',

  want:       '0xf7b112a42b2f68ce85e5f19ddc849327212d8132', //want,
  gauge:      '0x39e18682f0e988f667e18f193fb525fc2532f854', //gauge,
  router:     '0x2E14B53E2cB669f3A974CeaF6C735e134F3Aa9BC', //router,
  // router2:    '0x197b8F8185B84112dD95527ce472A55052cEE030', 

  fvm:        '0x07BB65fAaC502d4996532F834A1B7ba5dC32Ff96',
  ofvm:       '0xF9EDdca6B1e548B0EC8cDDEc131464F462b8310D',
  wftm:       '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  wftmHolder: '0x90469acbc4b6d877873cd4f1cca54fde8075a998',

  usdc:       '0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf',
  usdt:       '0xcc1b99dDAc1a33c201a742A1851662E87BC7f22C',

  grain:      '0x02838746d9e1413e07ee064fcbada57055417f21',
  ern:        '0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a',
}

const routes = {
  wftmToToken0: [{from:addrs.wftm, to:addrs.grain, stable:false}], // WFTM to GRAIN
  wftmToToken1: [
    {from:addrs.wftm, to:addrs.usdc, stable:false}, // WFTM -> USDC
    {from:addrs.usdc, to:addrs.ern, stable:true}, // USDC -> ERN
  ]
  // Works using own pool!!
  // wftmToToken1: [
  //   {from:addrs.wftm, to:addrs.grain, stable:false}, // WFTM -> GRAIN
  //   {from:addrs.grain, to:addrs.ern, stable:false}, // GRAIN -> ERN
  // ]
  // wftmToToken1: [
  //   {from:addrs.wftm, to:addrs.usdc, stable:false}, // WFTM -> USDC
  //   {from:addrs.usdc, to:addrs.usdt, stable:false}, // USDC -> USDT
  //   {from:addrs.usdt, to:addrs.ern, stable:false}, // USDT -> ERN
  // ]
}

let contractWFTM;
let contractPurse;
let contractStrat;
let contractVault;
let contractRouter;
let contractGauge;
let contractGrain;
let contractErn;
let contractWant;
let contractOfvm;
let contractFvm;

let _DepositAmount;
let _EarnedBalanceInVault;

let _SharePriceB4;
let _SharePriceAfter;

// Pair Details:
// {
//   symbol: 'vAMM-GRAIN/ERN',
//   name: 'GRAIN/ERN',
//   want: '0xf7b112a42b2f68ce85e5f19ddc849327212d8132',
//   gauge: '0x39e18682f0e988f667e18f193fb525fc2532f854',
//   token0: '0x02838746d9e1413e07ee064fcbada57055417f21',
//   token1: '0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a',
//   stable: false,
//   apr: 196.14638032110878,
//   tvl: 25058.6809652222
// },


// TEST:
describe('Testing GRAIN-ERN Strategy', async () => {

  before(async () => {
    // // Attempt to fix missing trie node error:
    // // *** JUST REMOVE chainId FROM HARDHAT CONFIG *** (and use basic ankr RPC url) ***
    // const jsonRpcUrl = hre.network.config?.forking?.url;
    // const remoteProvider = new ethers.providers.JsonRpcProvider(jsonRpcUrl)
    // const blockNumber = await remoteProvider.getBlockNumber()

    // await network.provider.send("hardhat_reset", [{
    //   forking: {
    //     jsonRpcUrl: jsonRpcUrl,
    //     blockNumber
    //   }
    // }])

    // Load up account with funds:
    await network.provider.send("hardhat_setBalance", [
      addrs.strategist,
      // ethers.utils.parseEther("10").toHexString(),
      "0xffffffffffffffff"
    ]);
    await network.provider.send("hardhat_setBalance", [
      addrs.wftmHolder,
      // ethers.utils.parseEther("10").toHexString(),
      "0xffffffffffffffff"
    ]);
    await network.provider.send("hardhat_setBalance", [
      addrs.user1,
      // ethers.utils.parseEther("10").toHexString(),
      "0xffffffffffffffff"
    ]);

    // Create contracts:
    contractWFTM = new ethers.Contract(addrs.wftm, ERC20ABI, ethers.provider)
    contractRouter = new ethers.Contract(addrs.router, ROUTERABI, ethers.provider)
    // contractRouter2 = new ethers.Contract(addrs.router2, ROUTERABI, ethers.provider)
    contractGrain = new ethers.Contract(addrs.grain, ERC20ABI, ethers.provider)
    contractErn = new ethers.Contract(addrs.ern, ERC20ABI, ethers.provider)
    contractWant = new ethers.Contract(addrs.want, ERC20ABI, ethers.provider)
    contractGauge = new ethers.Contract(addrs.gauge, GAUGEABI, ethers.provider)
    contractOfvm = new ethers.Contract(addrs.ofvm, ERC20ABI, ethers.provider)
    contractFvm = new ethers.Contract(addrs.fvm, ERC20ABI, ethers.provider)
  })

  describe('Deploy and Configure Purse', async () => {

    it('Deploy purse contract', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);

      // Deploy the Strategy:
      const Purse = await hre.ethers.getContractFactory("Purse");
      contractPurse = await Purse.connect(signer).deploy(
        [], 
        { 
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice,
        }
      );

      // console.log('Purse address', contractPurse.address)
    })

    it('Send WFTM to user1', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.wftmHolder);

      // Send WFTM from holder to Purse:
      const tx = await contractWFTM.connect(signer).transfer(
        addrs.user1, 
        ethers.utils.parseEther("1000")
      )
      await tx.wait()

      // Check wftm balance:
      const bal = await contractWFTM.balanceOf(addrs.user1)

      expect(bal).eq(ethers.utils.parseEther("1000"))
    })

    it('Send WFTM to purse', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.wftmHolder);

      // Send WFTM from holder to Purse:
      const tx = await contractWFTM.connect(signer).transfer(
        contractPurse.address, 
        ethers.utils.parseEther("10")
      )
      await tx.wait()

      // Check wftm balance:
      const bal = await contractWFTM.balanceOf(contractPurse.address)

      expect(bal).eq(ethers.utils.parseEther("10"))
    })

  })

  describe('Deploy Strategy and Vault', async () => {

    it('Deploy Strategy', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);

      // Deploy the Strategy:
      const Strategy = await hre.ethers.getContractFactory("FvmStratStd");

      contractStrat = await Strategy.deploy(
        addrs.want, //want,
        addrs.gauge, //gauge,
        addrs.router, //addrs.GLRouter,
        addrs.wftm, // fee token - WAVAX
        addrs.grain, //token0Addr,
        addrs.ern, //token1Addr,
        contractPurse.address,  // Purse address
        // GRAIN:
        routes.wftmToToken0,
        // [{from:addrs.wftm, to:'0x02838746d9e1413e07ee064fcbada57055417f21', stable:false}], // WFTM -> GRAIN
        // ERN:
        routes.wftmToToken1,
        // [
        //   {from:addrs.wftm, to:addrs.usdc, stable:false}, // WFTM -> USDC
        //   {from:addrs.usdc, to:addrs.usdt, stable:false}, // USDC -> USDT
        //   {from:addrs.usdt, to:'0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a', stable:false}, // USDT -> ERN
        // ],
        [{ from: addrs.fvm, to: addrs.wftm, stable: false }]  // <-- Fee token path (FVM to WFTM)
      , { 
        gasLimit: 15000000,
        gasPrice: feeData.gasPrice,
      });


      // address _want,
      // address _gauge,
      // address _router,
      // address _feeToken,
      // address _token0,
      // address _token1,
      // address _purse,
      // IFvmRouter.route[] memory _wftmToToken0Path,
      // IFvmRouter.route[] memory _wftmToToken1Path,
      // IFvmRouter.route[] memory _feeTokenPath

    })

    it('Deploy Vault', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);

      // Deploy the Strategy:
      const VaultV2 = await hre.ethers.getContractFactory("Vault");
      contractVault = await VaultV2.connect(signer).deploy(
        // IGlacierStrat _strategy:
        contractStrat.address,
        // string memory _name:
        'xF-GRAIN-ERN',
        // string memory _symbol:
        'xF-GRAIN-ERN'
      , { 
        maxFeePerGas: feeData.maxFeePerGas
      });

    })

    it('Update strategy and add to Purse', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);

      // Set the vault on the strat contract:
      const tx = await contractStrat.setAddress(1, contractVault.address)
      await tx.wait()

      // Add strategy to the Purse
      const txA = await contractPurse.addBorrower(contractStrat.address)
      await txA.wait()
    })

  })

  describe('Prepare and get some LP tokens', async () => {

    it('Get some WFTM', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.wftmHolder);

      // Send WFTM from holder to Purse:
      const tx = await contractWFTM.connect(signer).transfer(
        contractPurse.address, 
        ethers.utils.parseEther("1000")
      )
      await tx.wait()

      // Check wftm balance:
      // const bal = await contractWFTM.balanceOf(contractPurse.address)
      // console.log(ethers.utils.formatEther(bal))

      // expect(bal).eq(ethers.utils.parseEther("10"))
    })

    it('Allow Router to spend my tokens', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.user1);

      await Promise.all([
        // Allow router to take my tokens:
        contractWFTM.connect(signer).approve(addrs.router, ethers.utils.parseEther("100000")),

        // spend grain:
        contractGrain.connect(signer).approve(addrs.router, ethers.utils.parseEther("10000000")),
        // contractGrain.connect(signer).approve(addrs.router, ethers.utils.parseEther("10000000")),
        
        // spend ern:
        contractErn.connect(signer).approve(addrs.router, ethers.utils.parseEther("10000")),
        contractErn.connect(signer).approve(addrs.want, ethers.utils.parseEther("10000")),
      ])

    })

    it('Swap some WFTM to GRAIN', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.user1);
      const block = await ethers.provider.getBlock();

      // call router:
      const tx = await contractRouter.connect(signer).swapExactTokensForTokens(
        ethers.utils.parseEther("200"), 1, 
        routes.wftmToToken0, 
        addrs.user1, block.timestamp+100,
        {
          gasPrice: feeData.gasPrice,
          gasLimit: 6000000
        }
      )
      await tx.wait()

      // swapExactTokensForTokens(uint amountIn, uint amountOutMin, route[] calldata routes, address to, uint deadline)
    })

    it('Swap some GRAIN to ERN', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.user1);
      const block = await ethers.provider.getBlock();

      // call router:
      const tx = await contractRouter.connect(signer).swapExactTokensForTokens(
        ethers.utils.parseEther("1000"), 1, 
        // routes.wftmToToken1, 
        [
          {from:addrs.grain, to:addrs.ern, stable:false}
        ],
        addrs.user1, block.timestamp+100, {
          gasPrice: feeData.gasPrice,
          gasLimit: 6000000
        }
      )
      await tx.wait()

      // swapExactTokensForTokens(uint amountIn, uint amountOutMin, route[] calldata routes, address to, uint deadline)
    })

    it('Check balances', async () => {
      console.log(
        'Grain:', (await contractGrain.balanceOf(addrs.user1)) / 10**18,
        'Ern:', (await contractErn.balanceOf(addrs.user1)) / 10**18,
      )
    })

    it('Add liquidity to get LP', async () => {
      // Get a quote:
      const txQ = await contractRouter.quoteAddLiquidity(
        addrs.grain,
        addrs.ern,
        false,
        ethers.utils.parseEther('600'),
        ethers.utils.parseEther('9'),
      )


      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.user1);
      const block = await ethers.provider.getBlock();

      // Add grain and ern to get want (vAMM-GRAIN/ERN):
      const txAdd = await contractRouter.connect(signer).addLiquidity(
        addrs.grain, addrs.ern, false, 
        txQ.amountA, // ethers.utils.parseEther('600'),
        txQ.amountB, // ethers.utils.parseEther('9'),
        1, 1, 
        addrs.user1, block.timestamp+10000,
        {
          gasPrice: feeData.gasPrice,
          gasLimit: 20000000
        }
      )
      // console.log(txAdd)

      // get LP balance:
      const bal = await contractWant.balanceOf(addrs.user1)
      console.log('Want:', bal/10**18)

    })

  })

  describe('Interact with Vault', async () => {

    it ('Allow vault to spend my LP', async () => {
      const signer = await ethers.getImpersonatedSigner(addrs.user1)

      // need to allow 
      ;(await contractWant.connect(signer).approve(contractVault.address, ethers.utils.parseEther("200"))).wait()

      // Check allowance:
      const bal = await contractWant.allowance(addrs.user1, contractVault.address)
      // log(ethers.utils.formatEther(bal))

      expect(bal).gt(0);
    })

    // it('Test gauge contract', async () => {
    //   const dSupply = await contracts.gauge.derivedSupply()
    //   // console.log(dSupply/10**18)
    // })

    it.skip('Deposit direct into Gauge', async () => {
      const signer = await ethers.getImpersonatedSigner(addrs.user1)
      const myBal = await contractWant.balanceOf(addrs.user1)

      // approve spend for Gauge:
      await contractWant.connect(signer).approve(contractGauge.address, myBal)


      // deposit:
      const feeData = await hre.ethers.provider.getFeeData()
      const tx = await contractGauge.connect(signer).deposit(
        ethers.utils.parseEther('50'), 0,
        {
          gasLimit: 6000000,
          gasPrice: feeData.gasPrice
        })
      const txInfo = await tx.wait()

      // get my balance in teh gauge:
      const bal = await contractGauge.derivedBalance(addrs.user1)
      console.log(bal / 10**18)

    })

    it.skip('Check left', async () => {
      // const signer = await ethers.getImpersonatedSigner(addrs.user1)
      let bals = await Promise.all([
        contractGauge.left(addrs.fvm),
        contractGauge.left(addrs.ofvm)
      ])
      console.log('FVM left', bals[0]/10**18)
      
      // pass time:
      await time.increaseTo((await time.latest()) + 86400 * 2);
      
      bals = await Promise.all([
        contractGauge.left(addrs.fvm),
        contractGauge.left(addrs.ofvm)
      ])
      console.log('FVM left', bals[0]/10**18)
      
    })

    it.skip('Get reward', async () => {
      const signer = await ethers.getImpersonatedSigner(addrs.user1)

      let bals = await Promise.all([
        contractOfvm.balanceOf(addrs.user1),
        contractFvm.balanceOf(addrs.user1)
      ])
      // let balFvm = await contractFvm.balanceOf(addrs.user1)
      console.log('FVM Bal b4 getReward()', bals)

      const tx = await contractGauge.connect(signer).getReward(addrs.user1, [addrs.fvm])
      await tx.wait()
      // console.log('Reward:', reward / 10**18)

      // balFvm = await contractFvm.balanceOf(addrs.user1)
      // console.log('FVM Bal af getReward()', balFvm/10**18)
      bals = await Promise.all([
        contractOfvm.balanceOf(addrs.user1),
        contractFvm.balanceOf(addrs.user1)
      ])
      // let balFvm = await contractFvm.balanceOf(addrs.user1)
      console.log('FVM Bal af getReward()', bals)

    })

    it.skip('Pass time and harvest from gauge', async () => {
      const signer = await ethers.getImpersonatedSigner(addrs.user1)

      // pass time:
      await time.increaseTo((await time.latest()) + 86400 * 100);

      // Have i earned any?
      let earned = await contractGauge.earned(addrs.ofvm, addrs.user1) 
      console.log('I have earned:', earned / 10**18)

      // get my balance in teh gauge:
      const balGauge = await contractGauge.derivedBalance(addrs.user1)
      console.log('Gauge balance:', balGauge / 10**18)

      // // add some more:
      // const feeData = await hre.ethers.provider.getFeeData()
      // const tx = await contractGauge.connect(signer).deposit(
      //   ethers.utils.parseEther('20'), 0,
      //   {
      //     gasLimit: 6000000,
      //     gasPrice: feeData.gasPrice
      //   })
      // const txInfo = await tx.wait()

      // pass more time:
      // await time.increaseTo((await time.latest()) + 86400 * 10);


      await contractGauge.connect(signer).getReward(addrs.user1, [addrs.ofvm])
      
      // get oFVM balance:
      const bal = await contractOfvm.balanceOf(addrs.user1)
      console.log('oFVM reward Balance', bal / 10**18)

    }).timeout(1000000)


    it('Deposit LP into vault', async () => {
      const signer = await ethers.getImpersonatedSigner(addrs.user1)
      const myBal = await contractWant.balanceOf(addrs.user1)

      // save my deposit amount:
      _DepositAmount = myBal;

      // log('want.balanceOf', myBal/10**18)
      // console.log()
      
      const feeData = await hre.ethers.provider.getFeeData()
      const tx = await contractVault.connect(signer).depositAll({
        gasLimit: feeData.gasLimit,
        gasPrice: feeData.gasPrice
      })
      const txInfo = await tx.wait()

      // Get the new share price:
      _SharePriceB4 = await contractVault.getPricePerFullShare()

      // test for my deposit:
      const vBal = await contractVault.balance()
      // log(vBal)

      expect(vBal).eq(myBal)
    })
    
    it('Check balances of gauge', async () => {
      // const bal = contractWant.balanceOf(contractStrat.address);
      const bal = await contractStrat.balanceOfWant()
      console.log('Strat LP bal in gauge', bal / 10**18)
    })

    it('Pass time and harvest rewards', async () => {
      const signer = await ethers.getImpersonatedSigner(addrs.user1)

      // pass time:
      await time.increaseTo((await time.latest()) + 86400 * 2);

      const tx = await contractStrat.connect(signer).harvest()
      const rcpt = await tx.wait()

      // console.log(rcpt)

    }).timeout(1000000)

    it('Check balances', async () => {
      const bals = await Promise.all([
        contractWFTM.balanceOf(contractPurse.address),
        contractVault.getPricePerFullShare(),
        contractStrat.balanceOf(),
        contractVault.balanceOf(addrs.user1)
      ])

      console.log('Purse balance of WFTM', bals[0] / 10**18)
      console.log('Vault getPricePerFullShare', bals[1] / 10**18)
      console.log('Strat balance of LP', bals[2] / 10**18)
      console.log('User Vault balance', bals[3] / 10**18)

      _EarnedBalanceInVault = bals[3]

      console.log('Earned Diff:', (_EarnedBalanceInVault - _DepositAmount) / 10**18)
      
      // Get the new share price:
      _SharePriceAfter = bals[1]

      console.log(`B4: ${_SharePriceB4/10**18}, AF: ${_SharePriceAfter/10**18}`)
    })

    /// *** THIS IS NOT IN SCOPE ATM. FOCUS ON DEPLOYING COMPS ***
    it.skip('Calculate my share value', async () => {
      // Need to:
      //  - Get price of GRAIN
      //  - Get price of ERN
      //  - Calc GRAIN/ERN LP price

      // 1. Get price of GRAIN:
      //  - Get pair for GRAIN/USDC
      //  - Calc how much GRAIN per/USDC
      const pairAddrGrainUsdc = await contractRouter.pairFor(addrs.grain, addrs.usdc, false)
      console.log('GRAIN/USDC pool:', pairAddrGrainUsdc)
      const poolGrainUsdc = new ethers.Contract(pairAddrGrainUsdc, LPPAIRABI, ethers.provider)
      const grainUsdcReserves = await poolGrainUsdc.getReserves()
      console.log(grainUsdcReserves)
    })

    // it('Pass time and harvest', async () => {
    //   const daysToWait = 1
    //   const unlockTime = (await time.latest()) + 86400 * daysToWait;

    //   await time.increaseTo(unlockTime);

    //   // do a harvest:
    //   let feeData = await hre.ethers.provider.getFeeData()
    //   let tx = await contractStrat.harvest({
    //     gasLimit: 15000000,
    //     gasPrice: feeData.gasPrice
    //   })
    //   await tx.wait()

    //   await time.increaseTo(unlockTime + 86400 * daysToWait);

    //   // do a harvest:
    //   feeData = await hre.ethers.provider.getFeeData()
    //   tx = await contractStrat.harvest({
    //     gasLimit: 15000000,
    //     gasPrice: feeData.gasPrice
    //   })
    //   await tx.wait()

    // })

    it.skip('Pass time and harvest', async () => {
      const daysToWait = 100
      const unlockTime = (await time.latest()) + 86400 * daysToWait;

      await time.increaseTo(unlockTime);

      // Make a call to the gauge to test:
      const resp = await contractGauge.derivedBalance(contractStrat.address)
      console.log('Strat bal in Gauge', resp / 10**18)


      // How much reward is waiting?
      const rewardPending = await contractStrat.rewardBalance()
      console.log('Rewards pending:', rewardPending / 10**18)

      // do a harvest:
      const feeData = await hre.ethers.provider.getFeeData()
      const tx = await contractStrat.harvest({
        gasLimit: 15000000,
        gasPrice: feeData.gasPrice
      })
      const txInfo = await tx.wait()

    }).timeout(1000000)

  })

})