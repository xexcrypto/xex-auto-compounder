const { expect } = require("chai");
const ERC20ABI = require('./abi/ERC20.json');

const addrs = {
  GLRouter:   '0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC',
  wavax:      '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  glcr:       '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6',
  strategist: '0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e',
}

let slipIn;

describe("Slip In", async () => {

  before(async () => {
    // Give strategest acc some funds to deploy the contract:
    await network.provider.send("hardhat_setBalance", [
      addrs.strategist,
      ethers.utils.parseEther("10").toHexString(),
    ]);
  })

  describe('Set up contracts', async () => {

    it('Can deploy contracts', async () => {
      // Deploy the slip in contract:
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);
      const SlipIn = await hre.ethers.getContractFactory("SlipIn");
  
      // Deploy contract:
      slipIn = await SlipIn.connect(signer).deploy()
    })

  })

  describe('Try sliping in AVAX', async () => {

    it('Can slip in', async () => {
      //
      const tx = await slipIn.doSlipAvax(
        addrs.glcr,   //address _token0,
        addrs.wavax,  //address _token1,
        false,  //bool _stable,
        [{ from: addrs.wavax, to: addrs.glcr, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken0,
        [{ from: addrs.wavax, to: addrs.wavax, stable: false }], //IGlacierRouter.Routes[] memory _pathToToken1,
        '0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', //address _vault, 
        {value:ethers.utils.parseEther("1")}
      )
      const rcpt = await tx.wait()

      // const rcpt = await ethers.provider.getTransactionReceipt(tx.hash)
      console.log(rcpt.events)

      // console.log(tx)
    })

    it('Has Vault token balance', async () => {
      const Vault = new ethers.Contract('0x4fbfac932Bcbb9753eFd12AC7DFEe4BAf0bE3Eb8', ERC20ABI, ethers.provider)
      const bal = await Vault.balanceOf(addrs.strategist)

      console.log(bal)

      // expect(bal).gt(0)
    })

  })

})