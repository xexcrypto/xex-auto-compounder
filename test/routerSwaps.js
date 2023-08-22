const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ERC20ABI = require('./abi/ERC20.json');
const ROUTERABI = require('./abi/RouterJOE.json');
const { ethers } = require("hardhat");

const addrs = {
  strategist: '0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e',
  user1:      '0xE604E79c771AfcE72c5D5ceeB10FEFA47221b008',

  wftm: {
    addr:     '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    holder:   '0x90469acbc4b6d877873cd4f1cca54fde8075a998',
  },
  glcr: {
    addr:     '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6',
    holder:   '0x2688ea0152e918c448c888f4ae30b8dd510df843',
  },
  mim: {
    addr:     '0x130966628846BFd36ff31a822705796e8cb8C18D',
    holder:   '0xae64a325027c3c14cf6abc7818aa3b9c07f5c799',
  },
  wavax: {
    addr:     '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    holder:   '0xc73eed4494382093c6a7c284426a9a00f6c79939',
  },
  grape: {
    addr:     '0x5541D83EFaD1f281571B343977648B75d95cdAC2',
    holder:   '0xb382247667fe8ca5327ca1fa4835ae77a9907bc8'
  }
}

const routers = {
  traderjoe:  '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
  lydia:      '0xA52aBE4676dbfd04Df42eF7755F01A3c41f28D27',
  glacier:    '0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC',
}

/*******************************************
 * Vars - change here
 */

// Router to test:
const ROUTER      = routers.traderjoe;  // Trader Joe
// const ROUTER      = "0xA52aBE4676dbfd04Df42eF7755F01A3c41f28D27";  // Lydia (avax)

// const TOKEN_FROM  = 'glcr'; 
// const TOKEN_TO    = 'mim';

const TOKEN_FROM  = 'glcr'
const TOKEN_TO    = 'grape';

const PATH = [
  addrs.wavax.addr, addrs.mim.addr
]

// const SWAP_PATH = [ // Glacier(GLCR -> WAVAX) -> TraderJoe(WAVAX -> MIM -> GRAPE)
//   {
//     router:routers.glacier,
//     paths:[
//       // Glacier paths are formatted like this:
//       {from:addrs.glcr.addr, to:addrs.wavax.addr, stable:false},
//     ],
//     pathsSimple:[]
//   },
//   {
//     router:routers.traderjoe,
//     paths:[],
//     pathsSimple:[
//       // trader Joe paths are just addresses:
//       addrs.wavax.addr, addrs.mim.addr, addrs.grape.addr
//     ]
//   }
//   // {from:addrs.glcr.addr, to:addrs.wavax.addr, stable:false, router:routers.glacier},
//   // {from:addrs.wavax.addr, to:addrs.mim.addr, stable:false, router:routers.traderjoe},
// ]

const SWAP_PATH = [
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
]


const AMOUNT_TO_SWAP = "1242447167370134";//ethers.utils.parseEther("0.00012");// "1651150070407325462";


/*******************************************
 * The tests
 */
let contractRouter;
let contracts = {};

let minSwapAmount;

const TokenFromData = addrs[TOKEN_FROM];
// const TokenToData = addrs[TOKEN_TO];


describe('Testing Swaps', async () => {

  before(async () => {
    // Give funds to holders:
    for(let key of Object.keys(addrs)){
      if (addrs[key].holder){
        await network.provider.send("hardhat_setBalance", [
          addrs[key].holder,
          "0xfffffffffffffffffff"
        ]);
        // console.log(`${key} holder funded`)

        contracts[key] = new ethers.Contract(addrs[key].addr, ERC20ABI, ethers.provider)
      }
    }
    // Load up account with funds:
    await network.provider.send("hardhat_setBalance", [
      addrs.strategist,
      "0xfffffffffffffffffff"
    ]);
    await network.provider.send("hardhat_setBalance", [
      addrs.user1,
      "0xfffffffffffffffffff"
    ]);
    // console.log(`strat funded`)

    // Create WFTM contract:
    contractRouter = new ethers.Contract(ROUTER, ROUTERABI, ethers.provider)
  })

  describe('Load up on tokens', () => {

    // it.skip('check random holder balance', async () => {
    //   const bal = await ethers.provider.getBalance(addrs.mim.holder);
    //   console.log(bal / 10**18)
    // })

    it('Get some TOKEN_FROM', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(TokenFromData.holder);

      // get tokens from holder:
      const contract = new ethers.Contract(TokenFromData.addr, ERC20ABI, signer);
      const tx = await contract.transfer(addrs.user1, ethers.utils.parseEther("100"))
      await tx.wait()

      // check balance:
      const bal = await contracts[TOKEN_FROM].balanceOf(addrs.user1);
      
      expect(bal).eq(ethers.utils.parseEther("100"))
    })

  })

  describe('Use Router', () => {
    
    // it.skip('Swap tokens for tokens', async () => {
    //   const feeData = await hre.ethers.provider.getFeeData()
    //   const signer = await ethers.getImpersonatedSigner(addrs.user1);
    //   const block = await ethers.provider.getBlock();

    //   // allow router to take my FROM:
    //   const txA = await contracts[TOKEN_FROM].connect(signer).approve(ROUTER, ethers.utils.parseEther("1000"));
    //   await txA.wait()

    //   // swap tokens:
    //   const tx = await contractRouter.connect(signer).swapExactTokensForTokens(
    //     ethers.utils.parseEther("10"),
    //     "1",
    //     PATH,
    //     addrs.user1,
    //     block.timestamp + 2000,
    //     {
    //       gasLimit: 15000000,
    //       gasPrice: feeData.gasPrice,
    //     }
    //   )
    //   await tx.wait();

    //   // Check MIM balance:
    //   const bal = await contracts[TOKEN_TO].balanceOf(addrs.user1);
    //   console.log('Received:', bal / 10**18)
      
    // })

    it('Estimate expected amount out', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.user1);

      const Swapper = await hre.ethers.getContractFactory('SlipV2');
      const swapper = await Swapper.deploy(addrs.wavax.addr);

      // amountr to swap:
      const amountToSwap = "1651150070407325462";

      // Do the swap:
      console.log('swapping')
      const amount = await swapper.quoteSwap(
        // ethers.utils.parseEther("100"),
        AMOUNT_TO_SWAP,
        SWAP_PATH,
        {
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice,
        }
      )
      // await tx.wait()

      minSwapAmount = (amount * 80) / 100;

      console.log('QUOTE:', amount/10**18)
    })

    it('Multi Router swap GLCR to GRAPE (Glacier + TraderJoe)', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.user1);

      // GLCR -> WAVAX on Glacier
      // WAVAX -> MIM on TraderJoe
      // const path = [
      //   {
      //     router:routers.glacier,
      //     paths:[
      //       // Glacier paths are formatted like this:
      //       {from:addrs.glcr.addr, to:addrs.wavax.addr, stable:false},
      //     ],
      //     pathsSimple:[]
      //   },
      //   {
      //     router:routers.traderjoe,
      //     paths:[],
      //     pathsSimple:[
      //       // trader Joe paths are just addresses:
      //       addrs.wavax.addr, addrs.mim.addr, addrs.grape.addr
      //     ]
      //   }
      //   // {from:addrs.glcr.addr, to:addrs.wavax.addr, stable:false, router:routers.glacier},
      //   // {from:addrs.wavax.addr, to:addrs.mim.addr, stable:false, router:routers.traderjoe},
      // ]

      // Load up swaps contract to test:
      const Swapper = await hre.ethers.getContractFactory('SlipV2');
      const swapper = await Swapper.connect(signer).deploy(addrs.wavax.addr);

      // Allow contract to take my money:
      const txA = await contracts.glcr.connect(signer).approve(swapper.address, ethers.utils.parseEther("1000"));
      await txA.wait()

      console.log('Swapper Address', swapper.address)
      console.log('min Amount:', minSwapAmount/10**18)

      // Do the swap:
      console.log('swapping')
      const tx = await swapper.connect(signer).swap(
        AMOUNT_TO_SWAP, //ethers.utils.parseEther("100"),
        ethers.utils.parseEther((minSwapAmount/10**18).toString()),
        // minSwapAmount,
        SWAP_PATH,
        addrs.user1,
        {
          gasLimit: 15000000,
          gasPrice: feeData.gasPrice,
        }
      )
      await tx.wait()

    })

    it('Check received balance', async () => {
      // check balance:
      const bal = await contracts.grape.balanceOf(addrs.user1);
      console.log(`${TOKEN_TO} balance:`, bal / 10**18)
    })

  })

})