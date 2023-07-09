const { expect } = require("chai");
const ERC20ABI = require('./abi/ERC20.json');
const VAULTABI = require('../artifacts/contracts/interfaces/IVault.sol/IVault.json').abi;

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

describe("Testing Slip", async () => {

  before(async () => {
    // Give strategest acc some funds to deploy the contract:
    await network.provider.send("hardhat_setBalance", [
      addrs.strategist,
      ethers.utils.parseEther("10").toHexString(),
    ]);

    await network.provider.send("hardhat_setBalance", [
      addrs.user1,
      ethers.utils.parseEther("10").toHexString(),
    ]);

    // Make contracts:
    Vault = new ethers.Contract(addrs.vault, ERC20ABI, ethers.provider)
    Want = new ethers.Contract(addrs.want, ERC20ABI, ethers.provider)

    Signers.user1 = await ethers.getImpersonatedSigner(addrs.user1);
  })

  describe('Set up contracts', async () => {

    it('Can deploy contracts', async () => {
      // Deploy the slip in contract:
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);
      const SlipIn = await hre.ethers.getContractFactory("Slip");
  
      // Deploy contract:
      slipIn = await SlipIn.connect(signer).deploy()
    })

  })

  describe('Try sliping in AVAX', async () => {

    it('Get fee recip balance b4', async () => {
      const Wavax = new ethers.Contract(addrs.wavax, ERC20ABI, ethers.provider)
      const bal = await Wavax.balanceOf(addrs.strategist)

      console.log('Strat bal b4:', ethers.utils.formatEther(bal))
      feeRecipBal = bal / 10**18
    })

    it('Can slip in', async () => {
      //
      const feeData = await hre.ethers.provider.getFeeData()

      const tx = await slipIn.connect(Signers.user1).slipInAvax(
        addrs.glcr,   //address _token0,
        addrs.wavax,  //address _token1,
        false,  //bool _stable,
        [{ from: addrs.wavax, to: addrs.glcr, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken0,
        // [{ from: addrs.wavax, to: addrs.wavax, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken1,
        [], //IGlacierRouter.Routes[] memory _pathToToken1,
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {
          value:ethers.utils.parseEther("1"),
          // maxFeePerGas: feeData.maxFeePerGas
          maxFeePerGas: ethers.utils.parseUnits('50', 'gwei'),
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

    it('Can withdraw LP from vault', async () => {
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

      console.log('Strat bal af:', ethers.utils.formatEther(bal))
      console.log('Diff:', (bal / 10**18) - feeRecipBal)
    })

    it('Check value of returned LP', async () => {

    })

  })

})