const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const ERC20ABI = require('./ERC20.json');
// const WAVAXABI = require('./abi/WAVAX.json');
// const GLLPABI = require('./abi/GlacierLP.json');
// const GLRouterABI = require('./abi/GlacierRouter.json');

const { deployments, run } = require('hardhat');

const main = async () => {

  before(async () => {
    // Give strategest acc some funds to deploy the contract:
    // console.log(ethers.utils.parseEther("1000"))
    // await network.provider.send("hardhat_setBalance", [
    //   users.strategist,
    //   ethers.utils.parseEther("10").toHexString(),
    // ]);
    

    // contracts.glrouter = new ethers.Contract(addrs.GLRouter, GLRouterABI)
    // contracts.gllp = new ethers.Contract(addrs.LP, GLLPABI, ethers.provider)
    
    // contracts.wavax = new ethers.Contract(addrs.wavax, ERC20ABI, ethers.provider)
    // contracts.fbomb = new ethers.Contract(addrs.fbomb, ERC20ABI, ethers.provider)
    // contracts.glcr = new ethers.Contract(addrs.glcr, ERC20ABI, ethers.provider)

    // console.log('Awaiting deployments')
    // await deployments.fixture(['GLCR-fBOMB']);

    // const Token = await deployments.get('GLCR-fBOMB'); // Token is available because the fixture was executed
    // console.log(Token.address);

    // console.log(deployments)

    // await run("deploy", {deployAll:true})

    // const Token = await deployments.get('YAK-WAVAX'); // Token is available because the fixture was executed
    // console.log(Token.address);

  })

  describe('Set up contracts', async () => {

    // it('Set up', async () => {
    //   console.log('Awaiting deployments')
    //   await deployments.fixture(['GLCR-fBOMB']);
    // })

    it('Set vault address on strat', async () => {
      const signer = await ethers.getSigner(users.addr1)
      
      // Set the vault on the strat contract:
      // const tx = await contracts.strat.setVault(addrs.vault)
      // const tx = await contracts.strat.setAddress("vault", addrs.vault)
      // const tx = await contracts.strat.setAddress(1, addrs.vault)
      // await tx.wait()
    })

  })

}

// describe("MY TEST", main)