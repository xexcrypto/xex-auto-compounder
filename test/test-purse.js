const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

// const PURSEABI = require('../artifacts/contracts/Purse.sol/Purse.json').abi
const ERC20ABI = require('./abi/ERC20.json');

const addrs = {
  strategist: '0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e',

  wftm:       '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
  wftmHolder: '0x90469acbc4b6d877873cd4f1cca54fde8075a998',
}

let contractWFTM;
let contractPurse;


// TEST:
describe('Testing Purse', async () => {

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

    // Create WFTM contract:
    contractWFTM = new ethers.Contract(addrs.wftm, ERC20ABI, ethers.provider)
  })

  describe('Deploy', async () => {

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
          // maxFeePerGas: feeData.maxFeePerGas
        }
      );

      console.log('Purse address', contractPurse.address)

    })

    it('Send WFTM to purse', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.wftmHolder);

      // // New WFTM token contract:
      // const wftm = new ethers.Contract(addrs.wftm, 
      //   ["function deposit() public payable returns (uint256)"], 
      //   signer
      // );
      
      // // Deposit ftm to get WFTM:
      // const tx = await wftm.deposit({
      //   value: ethers.utils.parseEther("10"),
      //   maxFeePerGas: feeData.maxFeePerGas,
      // })

      // Send WFTM from holder to Purse:
      const tx = await contractWFTM.connect(signer).transfer(
        contractPurse.address, 
        ethers.utils.parseEther("10")
      )
      await tx.wait()

      // Check wftm balance:
      const bal = await contractWFTM.balanceOf(contractPurse.address)
      // console.log(ethers.utils.formatEther(bal))

      expect(bal).eq(ethers.utils.parseEther("10"))
    })

    it('Can withdraw from purse', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);

      const tx = await contractPurse.connect(signer).withdraw(
        addrs.wftm,
        ethers.utils.parseEther("5")
      )
      await tx.wait()

    })
    
    it('Non-borrower fails to withdraw from purse', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.wftmHolder);

      await expect(
        contractPurse.connect(signer).withdraw(
          addrs.wftm, 
          ethers.utils.parseEther("5")
        )
      ).to.be.revertedWith('AccessControl: account 0x90469acbc4b6d877873cd4f1cca54fde8075a998 is missing role 0xbf87e2252b7172d9c61058578b6bef80f9573784ab4e27044251da25a76ed28e');

    })

    it('Add address to role and borrow', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);

      const tx = await contractPurse.connect(signer).addBorrower(addrs.wftmHolder);
      await tx.wait()

      // Now, can wftmHolder borrow?
      const signerWftmHolder = await ethers.getImpersonatedSigner(addrs.wftmHolder);
      const txW = await contractPurse.connect(signerWftmHolder).withdraw(
        addrs.wftm,
        ethers.utils.parseEther("1")
      )
      await txW.wait()

      // Check balance is 1 less:
      const bal = await contractWFTM.balanceOf(contractPurse.address);

      expect(bal).to.eq(ethers.utils.parseEther("4"))
    })

    it('Remove address from borrow role and fail to borrow', async () => {
      const feeData = await hre.ethers.provider.getFeeData()
      const signer = await ethers.getImpersonatedSigner(addrs.strategist);

      const tx = await contractPurse.connect(signer).removeBorrower(addrs.wftmHolder);
      await tx.wait()

      // Now, can wftmHolder borrow?
      const signerWftmHolder = await ethers.getImpersonatedSigner(addrs.wftmHolder);
      await expect(
        contractPurse.connect(signerWftmHolder).withdraw(
          addrs.wftm, 
          ethers.utils.parseEther("1")
        )
      ).to.be.revertedWith('AccessControl: account 0x90469acbc4b6d877873cd4f1cca54fde8075a998 is missing role 0xbf87e2252b7172d9c61058578b6bef80f9573784ab4e27044251da25a76ed28e');

    })
    
  })

})