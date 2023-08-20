const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ERC20ABI = require('../../abi/ERC20.json');
const ROUTERABI = require('../abi/FVMRouterABI.json')
const GAUGEABI = require('../abi/FVMGaugeABI.json')
const LPPAIRABI = require('../abi/LPPair.json')

let contracts = {};

const addrs = {
  strategist: '0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e',
  user1:      '0xE604E79c771AfcE72c5D5ceeB10FEFA47221b008',

  want:       '0xf7b112a42b2f68ce85e5f19ddc849327212d8132', //want,
  gauge:      '0x39e18682f0e988f667e18f193fb525fc2532f854', //gauge,
  router:     '0x2E14B53E2cB669f3A974CeaF6C735e134F3Aa9BC', //router,

  fvm:        '0x07BB65fAaC502d4996532F834A1B7ba5dC32Ff96',
  ofvm:       '0xF9EDdca6B1e548B0EC8cDDEc131464F462b8310D',
  wftm:       '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  wftmHolder: '0x90469acbc4b6d877873cd4f1cca54fde8075a998',

  usdc:       '0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf',
  usdt:       '0xcc1b99dDAc1a33c201a742A1851662E87BC7f22C',

  grain:      '0x02838746d9e1413e07ee064fcbada57055417f21',
  ern:        '0xce1e3cc1950d2aaeb47de04de2dec2dc86380e0a',
}

module.exports.main = (
  stratName,
  stratId,
  want, gauge, token0Addr, token0Name, token1Addr, token1Name,
  hasToken0, token0Qty, 
  hasToken1, token1Qty,
  path0toX,
  path1toX,
  isStable
) => {

  return () => {

    before(async () => {
      // Give strategest acc some funds to deploy the contract:
      await network.provider.send("hardhat_setBalance", [
        addrs.strategist,
        "0xffffffffffffffffffff",
      ]);

      // Fund users account:
      await network.provider.send("hardhat_setBalance", [
        addrs.user1,
        "0xffffffffffffffffffff",
      ]);
      await network.provider.send("hardhat_setBalance", [
        hasToken0,
        "0xffffffffffffffffffff",
      ]);
      await network.provider.send("hardhat_setBalance", [
        hasToken1,
        "0xffffffffffffffffffff",
      ]);
      
      // create token contracts:
      // const routerAddr = router ? router : addrs.GLRouter
      contracts.router = new ethers.Contract(addrs.router, ROUTERABI, ethers.provider)
      contracts.want = new ethers.Contract(want, LPPAIRABI, ethers.provider)
      contracts.gauge = new ethers.Contract(gauge, GAUGEABI, ethers.provider)
      
      contracts.wftm = new ethers.Contract(addrs.wftm, ERC20ABI, ethers.provider)
      contracts.ofvm = new ethers.Contract(addrs.ofvm, ERC20ABI, ethers.provider)
      contracts.fvm = new ethers.Contract(addrs.fvm, ERC20ABI, ethers.provider)
      
      contracts.token0 = new ethers.Contract(token0Addr, ERC20ABI, ethers.provider)
      contracts.token1 = new ethers.Contract(token1Addr, ERC20ABI, ethers.provider)

    })

    describe('Deploy and Configure Purse', async () => {

      it('Deploy purse contract', async () => {
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.strategist);
  
        // Deploy the Strategy:
        const Purse = await hre.ethers.getContractFactory("Purse");
        contracts.purse = await Purse.connect(signer).deploy(
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
        const signer = await ethers.getImpersonatedSigner(addrs.user1);

        // get users balance:
        // const balu = await ethers.provider.getBalance(addrs.user1)
        // console.log('Balance', balu)

        // Deposit into WFTM:
        const WFTM = new ethers.Contract(addrs.wftm, ["function deposit() external payable returns (uint256)"], signer)
        const tx = await WFTM.deposit({
          value:ethers.utils.parseEther("1000"),
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice,
        })
        await tx.wait()
  
        // Check wftm balance:
        const bal = await contracts.wftm.balanceOf(addrs.user1)

        expect(bal).eq(ethers.utils.parseEther("1000"))
      })
  
      it('Send WFTM to purse', async () => {
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.user1);

        await (await contracts.wftm.connect(signer).transfer(
          contracts.purse.address, 
          ethers.utils.parseEther("10"),
          {
            gasLimit: 15000000,
            gasPrice: feeData.gasPrice,
          }
        )).wait()
  
        // Check wftm balance:
        const bal = await contracts.wftm.balanceOf(contracts.purse.address)
  
        expect(bal).eq(ethers.utils.parseEther("10"))
      })
  
    })

    describe('Set up contracts', async () => {

      it('Deploy Strategy', async () => {
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.strategist);
  
        // Deploy the Strategy:
        const Strategy = await hre.ethers.getContractFactory(stratName);
  
        contracts.strat = await Strategy.deploy(
          want, //want,
          gauge, //gauge,
          addrs.router, //addrs.GLRouter,
          addrs.wftm, // fee token - WAVAX
          token0Addr,
          token1Addr,
          contracts.purse.address,// purse
          path0toX,
          path1toX,
          [{ from: addrs.fvm, to: addrs.wftm, stable: false }]  // <-- Fee token path (FVM to WFTM)
        , { 
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice,
        });
      })

      it('Deploy Vault', async () => {
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.strategist);

        const VaultV2 = await hre.ethers.getContractFactory("Vault");
        contracts.vault = await VaultV2.connect(signer).deploy(
          contracts.strat.address,  // IGlacierStrat _strategy:
          stratId,  // string memory _name:
          stratId // string memory _symbol:
        , { 
          maxFeePerGas: feeData.maxFeePerGas
        });

      })

      it('Set vault address on strat', async () => {
        const signer = await ethers.getSigner(addrs.strategist)
        
        // Set the vault on the strat contract:
        const tx = await contracts.strat.setAddress(1, contracts.vault.address)
        await tx.wait()
        
        // Add strategy to the Purse
        const txA = await contracts.purse.addBorrower(contracts.strat.address)
        await txA.wait()
      })

      it('want() is correct LP token', async () => {
        const wantAddr = await contracts.vault.want()
        expect(wantAddr.toLowerCase()).eq(want.toLowerCase())
      })

    })

    describe('Prepare and get some LP tokens', async () => {

      it('Allow Router to spend my tokens', async () => {
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.user1);
  
        await Promise.all([
          // Allow router to take my tokens:
          contracts.wftm.connect(signer).approve(addrs.router, ethers.utils.parseEther("100000")),
  
          // spend token0:
          contracts.token0.connect(signer).approve(addrs.router, ethers.utils.parseEther("10000000")),
          // contracts.grain.connect(signer).approve(addrs.router, ethers.utils.parseEther("10000000")),
          // // contractGrain.connect(signer).approve(addrs.router, ethers.utils.parseEther("10000000")),
          
          // spend token1:
          contracts.token1.connect(signer).approve(addrs.router, ethers.utils.parseEther("10000")),
          contracts.token1.connect(signer).approve(addrs.want, ethers.utils.parseEther("10000")),
        ])
  
      })
  
      it('Swap some WFTM to token0', async () => {
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.user1);
        const block = await ethers.provider.getBlock();
  
        // call router:
        const tx = await contracts.router.connect(signer).swapExactTokensForTokens(
          ethers.utils.parseEther(token0Qty.toString()), 1, 
          path0toX, 
          addrs.user1, block.timestamp+100,
          {
            gasPrice: feeData.gasPrice,
            gasLimit: 6000000
          }
        )
        await tx.wait()
  
        // swapExactTokensForTokens(uint amountIn, uint amountOutMin, route[] calldata routes, address to, uint deadline)
      })
  
      it('Swap some WFTM to token1', async () => {
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.user1);
        const block = await ethers.provider.getBlock();
  
        // call router:
        const tx = await contracts.router.connect(signer).swapExactTokensForTokens(
          ethers.utils.parseEther(token1Qty.toString()), 1, 
          path1toX, // routes.wftmToToken1, 
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
          `token0 (${token0Name}):`, (await contracts.token0.balanceOf(addrs.user1)) / 10**18,
          `token1 (${token1Name}):`, (await contracts.token1.balanceOf(addrs.user1)) / 10**18,
        )
      })
  
      it('Add liquidity to get LP', async () => {
        // Get a quote:
        const txQ = await contracts.router.quoteAddLiquidity(
          token0Addr,
          token1Addr,
          isStable,
          ethers.utils.parseEther(token0Qty.toString()),
          ethers.utils.parseEther(token1Qty.toString()),
        )
  
  
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.user1);
        const block = await ethers.provider.getBlock();
  
        // Add grain and ern to get want (vAMM-GRAIN/ERN):
        const txAdd = await contracts.router.connect(signer).addLiquidity(
          token0Addr, token1Addr, isStable, 
          txQ.amountA, // ethers.utils.parseEther('600'),
          txQ.amountB, // ethers.utils.parseEther('9'),
          1, 1, 
          addrs.user1, block.timestamp+100000,
          {
            gasPrice: feeData.gasPrice,
            gasLimit: 20000000
          }
        )
        // console.log(txAdd)
  
        // get LP balance:
        const bal = await contracts.want.balanceOf(addrs.user1)
        console.log('Want:', bal/10**18)
  
      })
  
    })

    describe.skip('Interact with Vault', async () => {

      it ('Allow vault to spend my LP', async () => {
        const signer = await ethers.getImpersonatedSigner(addrs.user1)
  
        // need to allow 
        ;(await contracts.want.connect(signer).approve(contracts.vault.address, ethers.utils.parseEther("200"))).wait()
  
        // Check allowance:
        const bal = await contracts.want.allowance(addrs.user1, contracts.vault.address)
        // log(ethers.utils.formatEther(bal))
  
        expect(bal).gt(0);
      })

      it('Deposit LP into vault', async () => {
        const signer = await ethers.getImpersonatedSigner(addrs.user1)
        const myBal = await contracts.want.balanceOf(addrs.user1)
  
        // save my deposit amount:
        _DepositAmount = myBal;
  
        // log('want.balanceOf', myBal/10**18)
        // console.log()
        
        const feeData = await hre.ethers.provider.getFeeData()
        const tx = await contracts.vault.connect(signer).depositAll({
          gasLimit: feeData.gasLimit,
          gasPrice: feeData.gasPrice
        })
        const txInfo = await tx.wait()
  
        // Get the new share price:
        _SharePriceB4 = await contracts.vault.getPricePerFullShare()
  
        // test for my deposit:
        const vBal = await contracts.vault.balance()
        // log(vBal)
  
        expect(vBal).eq(myBal)
      })
      
      it('Check balances of gauge', async () => {
        // const bal = contractWant.balanceOf(contractStrat.address);
        const bal = await contracts.strat.balanceOfWant()
        console.log('Strat LP bal in gauge', bal / 10**18)
      })
  
      it('Pass time and harvest rewards', async () => {
        const signer = await ethers.getImpersonatedSigner(addrs.user1)
  
        // pass time:
        await time.increaseTo((await time.latest()) + 86400 * 2);
  
        const tx = await contracts.strat.connect(signer).harvest()
        const rcpt = await tx.wait()
  
        // console.log(rcpt)
  
      }).timeout(1000000)
  
      it('Check balances', async () => {
        const bals = await Promise.all([
          contracts.wftm.balanceOf(contracts.purse.address),
          contracts.vault.getPricePerFullShare(),
          contracts.strat.balanceOf(),
          contracts.vault.balanceOf(addrs.user1)
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

    })

  }

}