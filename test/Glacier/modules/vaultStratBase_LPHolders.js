const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const ERC20ABI = require('../abi/ERC20.json');
const WAVAXABI = require('../abi/WAVAX.json');
const GLLPABI = require('../abi/GlacierLP.json');
const GLRouterABI = require('../abi/GlacierRouter.json');
const GLGaugeABI = require('../abi/GlacierGauge.json');

const TOKEN_NAME = 'xG-fBOMB-wAVAX';

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

let contracts = {
  strat:  null,
  vault:  null,
  want:   null, // 
  glrouter: null,
  wavax:  null,
  glcr:   null,
  token0: null,
  token1: null,
  gauge: null,
}

let _DepositAmount = 0


// describe("GLCR / fBOMB", 

module.exports.main = (
  stratName,
  stratId,
  want, gauge, token0Addr, token0Name, token1Addr, token1Name,
  hasToken0, token0Qty, 
  hasToken1, token1Qty,
  path0toX,
  path1toX
) => {

  return () => {

    before(async () => {
      // Give strategest acc some funds to deploy the contract:
      await network.provider.send("hardhat_setBalance", [
        addrs.strategist,
        ethers.utils.parseEther("10").toHexString(),
      ]);

      // Fund users account:
      await network.provider.send("hardhat_setBalance", [
        addrs.user1,
        ethers.utils.parseEther("10").toHexString(),
      ]);
      await network.provider.send("hardhat_setBalance", [
        hasToken0,
        ethers.utils.parseEther("10").toHexString(),
      ]);
      await network.provider.send("hardhat_setBalance", [
        hasToken1,
        ethers.utils.parseEther("10").toHexString(),
      ]);
      
      // create token contracts:
      contracts.glrouter = new ethers.Contract(addrs.GLRouter, GLRouterABI)
      contracts.want = new ethers.Contract(want, GLLPABI, ethers.provider)
      contracts.gauge = new ethers.Contract(gauge, GLGaugeABI, ethers.provider)
      
      contracts.wavax = new ethers.Contract(addrs.wavax, ERC20ABI, ethers.provider)
      contracts.glcr = new ethers.Contract(addrs.glcr, ERC20ABI, ethers.provider)
      
      contracts.token0 = new ethers.Contract(token0Addr, ERC20ABI, ethers.provider)
      contracts.token1 = new ethers.Contract(token1Addr, ERC20ABI, ethers.provider)

    })

    describe('Set up contracts', async () => {

      it('Can deploy contracts', async () => {
        // Deploy contracts:
        const feeData = await hre.ethers.provider.getFeeData()
        const signer = await ethers.getImpersonatedSigner(addrs.strategist);

        // Deploy the Strategy:
        const Strategy = await hre.ethers.getContractFactory(stratName);


        if (stratName == 'StratXX'){
          console.log(`Deploying strategy '${stratName}' with these options:`, [
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            token0Addr,
            token1Addr,
            path0toX,
            path1toX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]
          ])
          
          contracts.strat = await Strategy.deploy(
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            token0Addr,
            token1Addr,
            path0toX,
            path1toX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]  // <-- Fee token path (glcr to wavax)
          , { 
            gasLimit: 15000000,
            gasPrice: feeData.gasPrice,
          });

          // stratName,
          // want, gauge, token0Addr, token0Name, token1Addr, token1Name,
          // hasToken0, token0Qty, 
          // hasToken1, token1Qty,
          // pathGlcrToToken

        //     want,
        //     gauge,
        //     addrs.GLRouter,
        //     addrs.sentinal,
        //     addrs.team,
        //     addrs.xexadon,
        //     addrs.wavax, // WAVAX
        //     [ { from: addrs.glcr, to: addrs.wavax, stable: false } ],
        //     [ { from: addrs.glcr, to: addrs.wavax, stable: false } ]
    
        } else {
          console.log(`Deploying strategy '${stratName}' with these options:`, [
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            token0,
            path0toX,
            // tokenX,
            // pathGlcrToTokenX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]
          ])
    
          contracts.strat = await Strategy.deploy(
            want,
            gauge,
            addrs.GLRouter,
            addrs.wavax, // fee token - WAVAX
            token0,
            path0toX,
            // tokenX,
            // pathGlcrToTokenX,
            [{ from: addrs.glcr, to: addrs.wavax, stable: false }]  // <-- Fee token path (glcr to wavax)
          , { 
            gasLimit: 15000000,
            gasPrice: feeData.gasPrice,
            // nonce: nonce+1
          });
          // console.log(strat, strat.interface.deploy.inputs)
    
        }

        // if (!pathGlcrToToken){
        //   contracts.strat = await XexWavaxGlacier.connect(signer).deploy(
        //     want,
        //     gauge,
        //     addrs.GLRouter,
        //     addrs.sentinal,
        //     addrs.team,
        //     addrs.xexadon,
        //     addrs.wavax, // WAVAX
        //     [ { from: addrs.glcr, to: addrs.wavax, stable: false } ],
        //     [ { from: addrs.glcr, to: addrs.wavax, stable: false } ]
        //   , { 
        //     maxFeePerGas: feeData.maxFeePerGas
        //   });
        // } else {
        //   contracts.strat = await XexWavaxGlacier.connect(signer).deploy(
        //     // address _want: vAMM-fBOMB/WAVAX <- Glacier LP token:
        //     want,
        //     // address _gauge: "@notice Gauges are used to incentivize pools, they emit reward tokens over 7 days for staked LP tokens":
        //     gauge,
        //     // address _router: <- Glacier Token Router:
        //     addrs.GLRouter,
        //     // '0xfE7Ce93ac0F78826CD81D506B07Fe9f459c00214', //addrs.GLRouter,
        //     // address _sentinel: <- Account who can panic, pause and unpause strategy:
        //     addrs.sentinal,
        //     // address _team: <- Account to receive fees:
        //     addrs.team,
        //     // address _xexadons, <- Receives fees:
        //     addrs.xexadon,
        //     // address _feeToken: <- WAVAX - Token to receive fees as:
        //     addrs.wavax, // WAVAX
        //     // '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', // GLCR

        //     // IGlacierRouter.Routes[] memory _glcrToWavaxPath:
        //     [{ from: addrs.glcr, to: addrs.wavax, stable: false }],

        //     //IGlacierRouter.Routes[] memory _glcrTofBombPath:
        //     pathGlcrToToken,
        //     // [
        //     //   { from: addrs.glcr, to: addrs.wavax, stable: false },
        //     //   { from: addrs.wavax,  to: addrs.fbomb, stable: false }
        //     // ],

        //     // IGlacierRouter.Routes[] memory _feeTokenPath:
        //     [ { from: addrs.glcr, to: addrs.wavax, stable: false } ]
        //   , { 
        //     maxFeePerGas: feeData.maxFeePerGas
        //   });
        // }

        const VaultV2 = await hre.ethers.getContractFactory("Vault");
        contracts.vault = await VaultV2.connect(signer).deploy(
          // IGlacierStrat _strategy:
          contracts.strat.address,
          // string memory _name:
          TOKEN_NAME,
          // string memory _symbol:
          TOKEN_NAME
        , { 
          maxFeePerGas: feeData.maxFeePerGas
        });

      })

      
      it('Set vault address on strat', async () => {
        const signer = await ethers.getSigner(addrs.user1)
        
        // Set the vault on the strat contract:
        const tx = await contracts.strat.setAddress(1, contracts.vault.address)
        await tx.wait()
      })

      it('want() is correct LP token', async () => {
        const wantAddr = await contracts.vault.want()
        expect(wantAddr).eq(want)
      })

      it('Dump strat addreses', async () => {
        
        // Check all:
        let addrGauge = await contracts.strat.gauge()
        log('Gauge:', addrGauge)

        let addrRouter = await contracts.strat.router()
        log('Router:', addrRouter)

        let addrTeam = await contracts.strat.team()
        log('Team:', addrTeam)

        let addrXex = await contracts.strat.xexadons()
        log('Xexad:', addrXex)

        let addrStrat = await contracts.strat.strategist()
        log('Strat:', addrStrat)

        let addrVault = await contracts.strat.vault()
        log('Vault:', addrVault)

        let addrWant = await contracts.strat.want()
        log('Want:', addrWant)

      })

    })

    describe('Checking Accounts', async () => {

      it('Fund an account', async () => {
        await network.provider.send("hardhat_setBalance", [
          addrs.user1,
          "0x1000000000000000000000",
        ]);
  
        const bal = await ethers.provider.getBalance(addrs.user1)
        // log(ethers.utils.formatEther(bal))
  
        expect(bal).gt(0);
      })

      it('Get some LP token', async () => {
        // transfer token from a holder:
        // const signer = await ethers.getSigner(users.hasFbomb)
        const signer = await ethers.getImpersonatedSigner(hasToken0)
        const feeData = await hre.ethers.provider.getFeeData()
  
        // Get amount to match with 1 wavax
        const token = new ethers.Contract(token0Addr, ERC20ABI, signer)
        const tx = await token.transfer(addrs.user1, ethers.utils.parseEther(token0Qty.toString()), {
          // maxFeePerGas: feeData.maxFeePerGas,
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice //feeData.gasPrice.mul(1.1)
        })
        await tx.wait()
  
        // confirm balance:
        const bal = await token.balanceOf(addrs.user1)
        log(`${token0Name} Balance:`, ethers.utils.formatEther(bal))
  
        expect(bal).gte(ethers.utils.parseEther(token0Qty.toString()))
      })

  //     it('Wrap some AVAX to WAVAX', async () => {
  //       const amountToConvert = 100

  //       // Transfer AVAX for our user:
  //       // const signer = await ethers.getSigner(users.addr1)
  //       const signer = await ethers.getImpersonatedSigner(addrs.user1);
  
  //       // load up wavax token:
  //       const WAVAX = new ethers.Contract(addrs.wavax, WAVAXABI, signer);
  //       const tx = await WAVAX.deposit({value:ethers.utils.parseEther(amountToConvert.toString())})
  //       await tx.wait()
  
  //       // test for wavax:
  //       const bal = await WAVAX.balanceOf(addrs.user1)
  //       // log(ethers.utils.formatEther(bal))

  //       // has balance:
  //       expect(bal).gte(ethers.utils.parseEther(amountToConvert.toString()))
  //     })
  
  //     it('Get some token0', async () => {
  //       // transfer token from a holder:
  //       // const signer = await ethers.getSigner(users.hasFbomb)
  //       const signer = await ethers.getImpersonatedSigner(hasToken0)
  //       const feeData = await hre.ethers.provider.getFeeData()
  
  //       // Get amount to match with 1 wavax
  //       const token = new ethers.Contract(token0Addr, ERC20ABI, signer)
  //       const tx = await token.transfer(addrs.user1, ethers.utils.parseEther(token0Qty.toString()), {
  //         // maxFeePerGas: feeData.maxFeePerGas,
  //         gasLimit: 15000000,
  //         gasPrice: feeData.gasPrice //feeData.gasPrice.mul(1.1)
  //       })
  //       await tx.wait()
  
  //       // confirm balance:
  //       const bal = await token.balanceOf(addrs.user1)
  //       log(`${token0Name} Balance:`, ethers.utils.formatEther(bal))
  
  //       expect(bal).gte(ethers.utils.parseEther(token0Qty.toString()))
  //     })
  
  //     it('Get some token1', async () => {
  //       // transfer token from a holder:
  //       // const signer = await ethers.getSigner(users.hasFbomb)
  //       const signer = await ethers.getImpersonatedSigner(hasToken1)
  //       const feeData = await hre.ethers.provider.getFeeData()
  //       const token = new ethers.Contract(token1Addr, ERC20ABI, signer)

  //       // Check to see if we need to get this:
  //       const myBal = await token.balanceOf(addrs.user1)
  //       if (myBal / 10**10 < token1Qty) {
  //         // Get amount to match with 1 wavax
  //         const tx = await token.transfer(addrs.user1, ethers.utils.parseEther(token1Qty.toString()), {
  //           // maxFeePerGas: feeData.maxFeePerGas,
  //           gasLimit: 15000000,
  //           gasPrice: feeData.gasPrice //feeData.gasPrice.mul(1.1)
  //         })
  //         await tx.wait()
  //       }
  
  //       // confirm balance:
  //       const bal = await token.balanceOf(addrs.user1)
  //       log(`${token1Name} Balance:`, ethers.utils.formatEther(bal))
  
  //       // expect(bal).eq(ethers.utils.parseEther(token1Qty.toString()))
  //       expect(bal).gt(0)
  //     })

  //     it('Get pair for tokens', async () => {
  //       const crt = new ethers.Contract(addrs.GLRouter, GLRouterABI, ethers.provider)

  //       const pairAddress = await crt.pairFor(token0Addr, token1Addr, false)
  //       // console.log(pairAddress)

  //       expect(pairAddress).eq(want)
  //     })

  //     it('Deposit to get some LP', async () => {
  //       const signer = await ethers.getSigner(addrs.user1)
  //       const feeData = await hre.ethers.provider.getFeeData()
  // // console.log(feeData)
  // // console.log(ethers.utils.formatEther(ethers.utils.parseEther("0.5")))
  // // console.log(addrs.wavax, addrs.xex, false, 
  // //   ethers.utils.parseEther("0.5"), ethers.utils.parseEther("25547770"), 
  // //   1, 1, users.addr1, block.timestamp+1)
  
  //       // need to allow 
  //       ;(await contracts.token0.connect(signer).approve(addrs.GLRouter, ethers.utils.parseEther("100000000000"))).wait()
  //       ;(await contracts.token1.connect(signer).approve(addrs.GLRouter, ethers.utils.parseEther("100000000000"))).wait()
  
  //       // Check allowance:
  //       // const bal = await contracts.wavax.allowance(users.addr1, addrs.GLRouter)
  //       // console.log(ethers.utils.formatEther(bal))
  
  //       // IGlacierRouter(router).addLiquidity(wavax, xex, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);
  //       const crt = new ethers.Contract(addrs.GLRouter, GLRouterABI, signer)

  //       console.log('Token0:', token0Addr, ethers.utils.parseEther(token0Qty.toString()))
  //       console.log('Token1:', token1Addr, ethers.utils.parseEther(token1Qty.toString()))
  
  //       const block = await ethers.provider.getBlock()
  //       // tx = await contracts.glrouter
  //         // .connect(signer)
  //       const tx = await crt
  //         .addLiquidity(
  //           token0Addr, token1Addr, false, 
  //           ethers.utils.parseEther(token0Qty.toString()), 
  //           ethers.utils.parseEther(token1Qty.toString()), 
  //           1, 1, addrs.user1, block.timestamp+10, {
  //             // maxFeePerGas: feeData.maxFeePerGas,
  //             gasLimit: 15000000,
  //             gasPrice: feeData.gasPrice, // 20281478843 //feeData.gasPrice.mul(1.1)
  //           });
  //       await tx.wait()
  
  //       // 25,547,770.16273054 per half an avax!
  
  //       // Get balance of LP for user:
  //       // const bal = await contracts.gllp.balanceOf(users.addr1)
  //       // console.log(ethers.utils.formatEther(bal))
  
  //       // check for LP tokens:
  //       // const bal = await contracts.gllp.balanceOf(addrs.user1)
  //       // console.log('LP Received:', ethers.utils.formatEther(bal))
  
  //       // expect(bal).gt(0);
  //     })
  
      // it('Deposit to get some Glacier (want) LP', async () => {
      //   const signer = await ethers.getSigner(addrs.user1)
      //   const feeData = await hre.ethers.provider.getFeeData()

      //   // need to allow 
      //   ;(await contracts.token0.connect(signer).approve(addrs.GLRouter, ethers.utils.parseEther("100000000000"))).wait()
      //   ;(await contracts.token1.connect(signer).approve(addrs.GLRouter, ethers.utils.parseEther("100000000000"))).wait()
  
      //   // IGlacierRouter(router).addLiquidity(wavax, xex, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);
      //   const crt = new ethers.Contract(addrs.GLRouter, GLRouterABI, signer)
      //   // const crt = new ethers.Contract('0xfE7Ce93ac0F78826CD81D506B07Fe9f459c00214', GLRouterABI, signer)

      //   log('Adding to pool', token0Qty/2, token1Qty/2)
      //   log('Adding to pool', token0Qty/2*10**16, token1Qty/2*10**16)
      //   log('Adding to pool', token0Qty/2*10**18, token1Qty/2*10**18)
      //   log('Adding to pool', ethers.utils.parseEther((token0Qty/2).toString()), ethers.utils.parseEther((token1Qty/2).toString()))
      //   log((1/10**16)*10**16)
  
      //   const block = await ethers.provider.getBlock()

      //   const qtx = await crt.quoteAddLiquidity(token0Addr, token1Addr, true, token0Qty, token1Qty)
      //   console.log(qtx)

      //   // console.log([
      //   //   token0Addr, token1Addr, true, 
      //   //   //ethers.utils.parseEther((token0Qty/2).toString()), ethers.utils.parseEther((token1Qty/2).toString()), 
      //   //   //(token0Qty/2*10**16).toString(), (token1Qty/2*10**16).toString(),
      //   //   "500000000000000000000", "630359500000000000000",
      //   //   // 1, 1, 
      //   //   qtx["amountA"], qtx["amountB"],
      //   //   addrs.user1, block.timestamp+100
      //   // ])

      //   const tx = await crt.addLiquidity(
      //       token0Addr, token1Addr, true, 
      //       //ethers.utils.parseEther((token0Qty/2).toString()), ethers.utils.parseEther((token1Qty/2).toString()), 
      //       //(token0Qty/2*10**16).toString(), (token1Qty/2*10**16).toString(),
      //       //"500000000000000000000", "630359500000000000000",
      //       "5000000000000000000", "6303595000000000000",
      //       //qtx["amountA"], qtx["amountB"],
      //       // (token0Qty/2).toString(), (token1Qty/2).toString(),
      //       1, 1, 
      //       addrs.user1, block.timestamp+100, {
      //         // maxFeePerGas: feeData.maxFeePerGas,
      //         gasLimit: 15000000,
      //         gasPrice: feeData.gasPrice,//20281478843 //feeData.gasPrice.mul(1.1)
      //       });
      //   await tx.wait()
  
      //   // check for LP tokens:
      //   const bal = await contracts.want.balanceOf(addrs.user1)
      //   log('Want (LP) Received:', ethers.utils.formatEther(bal))

      //   // Save original amount of LP:
      //   _DepositAmount = bal
  
      //   expect(bal / 10**18).gt(0);
      // })

  
    })

    describe('Interact with Vault', async () => {

      it ('Allow vault to spend my LP', async () => {
        const signer = await ethers.getSigner(addrs.user1)
  
        // need to allow 
        ;(await contracts.want.connect(signer).approve(contracts.vault.address, ethers.utils.parseEther("100000000000"))).wait()
  
        // Check allowance:
        const bal = await contracts.want.allowance(addrs.user1, contracts.vault.address)
        // log(ethers.utils.formatEther(bal))
  
        expect(bal).gt(0);
      })

      it('Deposit LP into vault', async () => {
        const signer = await ethers.getSigner(addrs.user1)
        const myBal = await contracts.want.balanceOf(addrs.user1)
        
        const tx = await contracts.vault.connect(signer).depositAll()
        const txInfo = await tx.wait()
  
        // test for my deposit:
        vBal = await contracts.vault.balance()
        // log(vBal)

        expect(vBal).eq(myBal)
      })

      
      it('Advance and harvest', async () => {
        const daysToWait = 1
        const unlockTime = (await time.latest()) + 86400 * daysToWait; // Add one day


        // Get aamount of reward available:
        log(`Increase ${daysToWait} day`)
        await time.increaseTo(unlockTime);

        // Make a call to the gauge to test:
        const resp = await contracts.gauge.balanceOf(contracts.strat.address)
        log('Strat bal in Gauge', resp / 10**18)

        // Get the want balance in the contract:
        const respW = await contracts.want.balanceOf(contracts.strat.address)
        log('Want bal in Strat', respW / 10**18)

        
        // do a harvest:
        const feeData = await hre.ethers.provider.getFeeData()
        const tx = await contracts.strat.harvest({
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice
        })
        // log(tx)
        const txInfo = await tx.wait()

        // log(txInfo)

        // log('TEST_RewardReceived', getEvents(txInfo, "TEST_RewardReceived").amount / 10**18)
        // log('TEST_FeeTokenReceived', getEvents(txInfo, "TEST_FeeTokenReceived").amount / 10**18)
        
        // Get the want balance in the contract:
        const respW2 = await contracts.want.balanceOf(contracts.strat.address)
        log('Want bal in Strat', respW2 / 10**18)

        // Make a call to the gauge to test:
        const respS = await contracts.gauge.balanceOf(contracts.strat.address)
        log('New strat bal in Gauge', respS / 10**18, (respS-resp)/10**18)

        
        // // get valut balance:
        // let vBal = await contracts.vault.balance()
        // log('Vault Balance:', vBal / 10**18)

      }).timeout(1000000)
  
      it('Advance and harvest 2', async () => {
        const daysToWait = 1
        const unlockTime = (await time.latest()) + 86400 * daysToWait; // Add one day


        // Get aamount of reward available:
        log(`Increase ${daysToWait} day`)
        await time.increaseTo(unlockTime);

        // Make a call to the gauge to test:
        const resp = await contracts.gauge.balanceOf(contracts.strat.address)
        log('Strat bal in Gauge', resp / 10**18)

        // Get the want balance in the contract:
        const respW = await contracts.want.balanceOf(contracts.strat.address)
        log('Want bal in Strat', respW / 10**18)

        
        // do a harvest:
        const feeData = await hre.ethers.provider.getFeeData()
        const tx = await contracts.strat.harvest({
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice
        })
        // log(tx)
        const txInfo = await tx.wait()

        // log(txInfo)

        // log('TEST_RewardReceived', getEvents(txInfo, "TEST_RewardReceived").amount / 10**18)
        // log('TEST_FeeTokenReceived', getEvents(txInfo, "TEST_FeeTokenReceived").amount / 10**18)
        
        // Get the want balance in the contract:
        const respW2 = await contracts.want.balanceOf(contracts.strat.address)
        log('Want bal in Strat', respW2 / 10**18)

        // Make a call to the gauge to test:
        const respS = await contracts.gauge.balanceOf(contracts.strat.address)
        log('New strat bal in Gauge', respS / 10**18, (respS-resp)/10**18)

        
        // // get valut balance:
        // let vBal = await contracts.vault.balance()
        // log('Vault Balance:', vBal / 10**18)

      }).timeout(1000000)
  
      it('Withdraw more than deposited', async () => {
        const signer = await ethers.getSigner(addrs.user1)
        
        // Withdraw:
        let tx = await contracts.vault.connect(signer).withdrawAll()
        await tx.wait()
  
        // Get balance again:
        const VaultBal = await contracts.vault.balanceOf(addrs.user1)
        log('MY Vault Bal:', VaultBal / 10**18)
  
        // Get balance again:
        const LPBal = await contracts.want.balanceOf(addrs.user1)
        log('MY want (LP) Withdrawn:', LPBal / 10**18)

        expect(LPBal).gt(_DepositAmount)
  
      })
  
    })


  }

}

const log = (msg, msg1, msg2) => {
  // return

  const msgs = [msg, msg1, msg2].filter(m => m != undefined)
  console.log(...msgs)
}

        
const getEvents = (txInfo, eventName) => {
  let events = txInfo.events;
  let testEvent = events.filter(({event}) => event == eventName)[0]
  return testEvent.args
}
