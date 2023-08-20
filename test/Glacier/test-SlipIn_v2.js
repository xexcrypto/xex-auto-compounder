const { expect } = require("chai");
const ERC20ABI = require('./abi/ERC20.json');
const VAULTABI = require('../../artifacts/contracts/interfaces/IVault.sol/IVault.json').abi;
const WRAPPEDABI = require('./abi/WAVAX.json');

const addrs = {
  GLRouter:   '0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC',
  wavax:      '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  glcr:       '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6',
  strategist: '0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e',
  user1:      '0xE604E79c771AfcE72c5D5ceeB10FEFA47221b008',
  sentinal:   '0x13571a5f94ff06b4418df229bd2fc781461cd88e',
  vault:      '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8',
  want:       '0x2071A39DA7450d68e4F4902774203DF208860Da2',
}

let slipIn;
let feeRecipBal = 0;
let Vault;
let Signers = {};
let Want;
let Wavax;

describe("Testing Slip v2", async () => {

  before(async () => {
    // Give strategest acc some funds to deploy the contract:
    await network.provider.send("hardhat_setBalance", [
      addrs.strategist,
      // ethers.utils.parseEther("10").toHexString(),
      "0xffffffffffffffffffff"
    ]);

    await network.provider.send("hardhat_setBalance", [
      addrs.user1,
      // ethers.utils.parseEther("10").toHexString(),
      "0xffffffffffffffffffff"
    ]);

    // Make contracts:
    Vault = new ethers.Contract(addrs.vault, ERC20ABI, ethers.provider)
    Want = new ethers.Contract(addrs.want, ERC20ABI, ethers.provider)
    
    Wavax = new ethers.Contract(addrs.wavax, WRAPPEDABI, ethers.provider)

    Signers.user1 = await ethers.getImpersonatedSigner(addrs.user1);
  })

  describe('Set up contracts', async () => {

    it('Can deploy contracts', async () => {
      // Deploy the slip in contract:
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);
      const SlipIn = await hre.ethers.getContractFactory("SlipV2");
  
      // Deploy contract:
      slipIn = await SlipIn.connect(signer).deploy(addrs.wavax)

      console.log('SlipV2:', slipIn.address)
    })

    it('Get some WAVAX', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const tx = await Wavax.connect(Signers.user1).deposit({value:ethers.utils.parseEther('100'), maxFeePerGas:feeData.maxFeePerGas})
      await tx.wait();

      // get bal:
      const myBal = await Wavax.balanceOf(addrs.user1);

      expect(myBal).greaterThanOrEqual(ethers.utils.parseEther('100'));
    })

  })

  describe('Try sliping in AVAX', async () => {

    it('Get fee recip balance b4', async () => {
      const bal = await Wavax.balanceOf(addrs.strategist)

      console.log('Strat bal b4:', ethers.utils.formatEther(bal))
      feeRecipBal = bal / 10**18
    })

    it('Can slip in Native', async () => {
      //
      const feeData = await hre.ethers.provider.getFeeData()

      const tx = await slipIn.connect(Signers.user1).slipInNative(
        addrs.glcr,   //address _token0,
        addrs.wavax,  //address _token1,
        false,  //bool _stable,
        [{router:addrs.GLRouter,pathsSimple:[],paths:[{ from: addrs.wavax, to: addrs.glcr, stable: false }]}], //IGlacierRouter.Routes[] memory _pathToToken0,
        // [{ from: addrs.wavax, to: addrs.wavax, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken1,
        [], //IGlacierRouter.Routes[] memory _pathToToken1,
        1,  // Min amount swap for token 0
        1,  // Min amount swap for token 1
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {
          value:ethers.utils.parseEther("10"),
          maxFeePerGas: feeData.maxFeePerGas
          // maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
          // gasLimit: 6000000,
          // gasPrice: ethers.utils.parseUnits('50', 'gwei'),
        }
      )
      const rcpt = await tx.wait()

      // const rcpt = await ethers.provider.getTransactionReceipt(tx.hash)
      // console.log(rcpt.events[5].args['amount'] / 10**18)

      // console.log(tx)
    })

    it('User received Vault token balance', async () => {
      const bal = await Vault.connect(ethers.provider).balanceOf(Signers.user1.address)

      console.log('VAULT RECEIVED:', bal/10**18)
      expect(bal/10**18).gt(0)
    })

    it.skip('Can withdraw LP from vault', async () => {
      const v = new ethers.Contract(addrs.vault, VAULTABI, Signers.user1)
      const tx = await v.withdrawAll()
      await tx.wait()

      // Check user balance of want:
      const bal = await Want.balanceOf(addrs.user1)
      console.log(bal / 10**18)
      // const v = new ethers.Contract(addrs.vault, VAULTABI, Signers.user1)
      // const tx2 = await v.
    })

    it('Get fee recip balance after', async () => {
      const Wavax = new ethers.Contract(addrs.wavax, ERC20ABI, ethers.provider)
      const bal = await Wavax.balanceOf(addrs.strategist)

      console.log('Fee recip bal b4:', ethers.utils.formatEther(bal))
      console.log('Fee received:', (bal / 10**18) - feeRecipBal)
    })


  })


  describe.skip('Try slipping out AVAX', async () => {

    it('Can Slip Out AVAX', async () => {
      // Get amount of LP i have:





      const feeData = await hre.ethers.provider.getFeeData()

      const tx = await slipIn.connect(Signers.user1).slipOutNative(
        addrs.glcr,   //address _token0,
        addrs.wavax,  //address _token1,
        false,  //bool _stable,
        [{router:addrs.GLRouter,pathsSimple:[],paths:[{ from: addrs.wavax, to: addrs.glcr, stable: false }]}], //IGlacierRouter.Routes[] memory _pathToToken0,
        // [{ from: addrs.wavax, to: addrs.wavax, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken1,
        [], //IGlacierRouter.Routes[] memory _pathToToken1,
        1,  // Min amount swap for token 0
        1,  // Min amount swap for token 1
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {
          value:ethers.utils.parseEther("10"),
          maxFeePerGas: feeData.maxFeePerGas
          // maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
          // gasLimit: 6000000,
          // gasPrice: ethers.utils.parseUnits('50', 'gwei'),
        }
      )
      const rcpt = await tx.wait()

      // uint256 amount,
      // address token0,
      // address token1,
      // bool stable,
      // Path[] memory pathToToken0,
      // Path[] memory pathToToken1,
      // uint256 minAmountOut0,
      // uint256 minAmountOut1,
      // address vault,
      // address lpToken

    })
    
  })









  describe.skip('Try sliping in WAVAX', async () => {
    
    it('Get fee recip balance b4', async () => {
      const bal = await Wavax.balanceOf(addrs.strategist)

      console.log('Strat bal b4:', ethers.utils.formatEther(bal))
      feeRecipBal = bal / 10**18
    })

    it('Convert AVAX to WAVAX', async () => {
      const amountToDeposit = ethers.utils.parseEther("1")
      const tx = await Wavax.connect(Signers.user1).deposit({value:amountToDeposit})
      const rcpt = await tx.wait()

      // Get balance of Wavax:
      const bal = await Wavax.balanceOf(addrs.user1)
      console.log('User1 balance:', bal/10**18)

      expect(bal).gt(0)
    })

    it('Approve Slip to spend my WAVAX', async () => {
      const amountToSlip = ethers.utils.parseEther("1")
      const tx = await Wavax.connect(Signers.user1).approve(slipIn.address, amountToSlip)
      await tx.wait()

      // get allowance:
      const allowance = await Wavax.allowance(addrs.user1, slipIn.address)
      console.log('WAVAX Allowance:', allowance / 10**18)

      expect(allowance).gte(amountToSlip)
    })

    it('Can slip in WAVAX', async () => {
      //
      const feeData = await hre.ethers.provider.getFeeData()

      const tx = await slipIn.connect(Signers.user1).slipIn(
        ethers.utils.parseEther("1"),
        addrs.glcr,   //address _token0,
        addrs.wavax,  //address _token1,
        false,  //bool _stable,
        [{router:addrs.GLRouter, pathsSimple:[], paths:[{ from: addrs.wavax, to: addrs.glcr, stable: false }]}], //IGlacierRouter.Routes[] memory _pathToToken0,
        // [{ from: addrs.wavax, to: addrs.wavax, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken1,
        [], //IGlacierRouter.Routes[] memory _pathToToken1,
        1,
        1,
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {
          // value:ethers.utils.parseEther("1"),
          // maxFeePerGas: feeData.maxFeePerGas
          maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
          // gasLimit: 6000000,
          // gasPrice: ethers.utils.parseUnits('50', 'gwei'),
        }
      )
      const rcpt = await tx.wait()

      // const rcpt = await ethers.provider.getTransactionReceipt(tx.hash)
      // console.log(rcpt.events)

      // console.log(tx)
    })

    it('User received Vault token balance', async () => {
      const bal = await Vault.connect(ethers.provider).balanceOf(Signers.user1.address)

      expect(bal/10**18).gt(0)
    })

    it.skip('Can withdraw LP from vault', async () => {
      const v = new ethers.Contract(addrs.vault, VAULTABI, Signers.user1)
      const tx = await v.withdrawAll()
      await tx.wait()

      // Check user balance of want:
      const bal = await Want.balanceOf(addrs.user1)
      console.log(bal / 10**18)
      // const v = new ethers.Contract(addrs.vault, VAULTABI, Signers.user1)
      // const tx2 = await v.
    })

  })



  describe('Try Slip Out', async () => {

    it('Can slip out AVAX', async () => {
      const balVault = await Vault.balanceOf(addrs.user1);
      // const balWavax = Wavax.balanceOf(addrs.user1);
      const bal = await ethers.provider.getBalance(addrs.user1)

      // Allowance for slip to take my vault tokens:
      const txAllow = await Vault.connect(Signers.user1).approve(slipIn.address, bal);

      // Withdraw sing slip:
      const feeData = await hre.ethers.provider.getFeeData()

      const tx = await slipIn.connect(Signers.user1).slipOutNative(
        balVault,
        [{router:addrs.GLRouter, pathsSimple:[], paths:[{ from: addrs.glcr, to: addrs.wavax, stable: false }]}],
        [],
        1,
        1,
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {
          maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
        }
      )
      await tx.wait();

      // Get new WAVAX balance:
      // const newBalWavax = Wavax.balanceOf(addrs.user1);
      const balNew = await ethers.provider.getBalance(addrs.user1)

      console.log('Wavax Balances:', bal/10**18, balNew/10**18)

    })
    
  })





  describe('Try sliping in WAVAX', async () => {

    it('Get fee recip balance b4', async () => {
      const bal = await Wavax.balanceOf(addrs.strategist)

      console.log('Strat bal b4:', ethers.utils.formatEther(bal))
      feeRecipBal = bal / 10**18
    })

    it('Can slip in Wrapped (324)', async () => {
      //
      const feeData = await hre.ethers.provider.getFeeData()

      // Check allowance:
      const existAllowBal = await Wavax.allowance(addrs.user1, slipIn.address);
      console.log('Existing allowance:', existAllowBal/10**18)

      // My balance:
      const myWavaxBal = await Wavax.balanceOf(addrs.user1);
      console.log('My Wavax Balance:', myWavaxBal/10**18)

      

      // Allow slip to take my Wavax:
      const balAllowance = await Wavax.allowance(addrs.user1, slipIn.address);
      const txAllow = await Wavax.connect(Signers.user1).approve(slipIn.address, ethers.utils.parseEther("1000"));
      await txAllow.wait()

      const tx = await slipIn.connect(Signers.user1).slipIn(
        ethers.utils.parseEther("10"),
        addrs.glcr,   //address _token0,
        addrs.wavax,  //address _token1,
        false,  //bool _stable,
        [{router:addrs.GLRouter,pathsSimple:[],paths:[{ from: addrs.wavax, to: addrs.glcr, stable: false }]}], //IGlacierRouter.Routes[] memory _pathToToken0,
        // [{ from: addrs.wavax, to: addrs.wavax, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken1,
        [], //IGlacierRouter.Routes[] memory _pathToToken1,
        1,  // Min amount swap for token 0
        1,  // Min amount swap for token 1
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {
          maxFeePerGas: feeData.maxFeePerGas
          // gasLimit: 15000000,
          // gasPrice: ethers.utils.parseUnits('50', 'gwei'),
        }
      )
      const rcpt = await tx.wait()

      // const rcpt = await ethers.provider.getTransactionReceipt(tx.hash)
      // console.log(rcpt.events[5].args['amount'] / 10**18)

      // console.log(tx)
    })

    it('User received Vault token balance', async () => {
      const bal = await Vault.connect(ethers.provider).balanceOf(Signers.user1.address)

      console.log('VAULT RECEIVED:', bal/10**18)
      expect(bal/10**18).gt(0)
    })

    it.skip('Can withdraw LP from vault', async () => {
      const v = new ethers.Contract(addrs.vault, VAULTABI, Signers.user1)
      const tx = await v.withdrawAll()
      await tx.wait()

      // Check user balance of want:
      const bal = await Want.balanceOf(addrs.user1)
      console.log('Want Balance:', bal / 10**18)
      // const v = new ethers.Contract(addrs.vault, VAULTABI, Signers.user1)
      // const tx2 = await v.
    })

    it('Get fee recip balance after', async () => {
      const Wavax = new ethers.Contract(addrs.wavax, ERC20ABI, ethers.provider)
      const bal = await Wavax.balanceOf(addrs.strategist)

      console.log('Fee recip bal b4:', ethers.utils.formatEther(bal))
      console.log('Fee received:', (bal / 10**18) - feeRecipBal)
    })
  })


  describe('Try Slip Out', async () => {

    it('Can slip out WAVAX', async () => {
      const balVault = await Vault.balanceOf(addrs.user1);
      // const balWavax = Wavax.balanceOf(addrs.user1);
      const bal = await ethers.provider.getBalance(addrs.user1)

      // Allowance for slip to take my vault tokens:
      const txAllow = await Vault.connect(Signers.user1).approve(slipIn.address, bal);

      // Withdraw sing slip:
      const feeData = await hre.ethers.provider.getFeeData()

      const tx = await slipIn.connect(Signers.user1).slipOut(
        balVault,
        [{router:addrs.GLRouter, pathsSimple:[], paths:[{ from: addrs.glcr, to: addrs.wavax, stable: false }]}],
        [],
        1,
        1,
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {
          maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
        }
      )
      await tx.wait();

      // Get new WAVAX balance:
      // const newBalWavax = Wavax.balanceOf(addrs.user1);
      const balNew = await ethers.provider.getBalance(addrs.user1)

      console.log('Wavax Balances:', bal/10**18, balNew/10**18)

    })
    
  })

})

const estimateSwap = (amount, multiPath) => {

}