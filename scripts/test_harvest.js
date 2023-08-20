const WETHABI = require('./abi/WETH.json')
const STRATABI = require('../artifacts/contracts/StratGlcrX.sol/StratGlcrX.json').abi

const main = async () => {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const unlockTime = currentTimestampInSeconds + 60;

  // const lockedAmount = hre.ethers.utils.parseEther("0.001");

  // Get my signer:
  // const signer = await ethers.getSigner("0x945d659DdeE7D5E229EEf50C9ad3b6A4A18A2964")//addrs.strategist)
  const signer = await ethers.getSigner()

  console.log(signer.address)

  // Load the contract:
  const strat = new ethers.Contract("0x5bEc82EFA555b2419e91d828381ddbF349E12fA0", STRATABI, signer)

  // Read strat data:
  const gauge = await strat.gauge()
  console.log(gauge)

  // get reward balance:
  const wBal = await strat.rewardBalance()
  console.log(wBal/10**18)

  // Do a harvest:
  const feeData = await ethers.provider.getFeeData()
  const tx = await strat.harvest({
    maxFeePerGas: feeData.maxFeePerGas
  })
  console.log(tx)

  const rcpt = await tx.wait()
  console.log(rcpt)


  // Test using a signer:
  // const signer = await ethers.getSigner()//addrs.strategist)
  // console.log('Signer addr:', signer.address)

  // const wethAddr = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  // const contractAddr = "0x525C7063E7C20997BaaE9bDa922159152D0e8417";
  // const destAcc = "0xa1D6BA78Ae28a7919410caBe0B82B0e9D63390c7";

  // const WETH = new ethers.Contract('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', WETHABI, signer);

  // // Get balance of contract acc:
  // const bal = await WETH.balanceOf(contractAddr)
  // console.log(bal/10**18)

  // // get target acc balance of weth:
  // const balDest = await WETH.balanceOf(destAcc)
  // console.log('Dest acc bal:', balDest/10**18)


  // // Load up contract:
  // const cnct = new ethers.Contract(contractAddr, '["function inCaseTokensGetStuck(address _token) external"]', signer);
  // // console.log(cnct)

  // // const tx = await cnct.approve()
  // // const tx2 = await WETH.transferFrom(contractAddr, destAcc, bal);
  // const tx2 = await cnct.inCaseTokensGetStuck(wethAddr)
  // console.log(tx2)
  // const rcp2 = await tx2.wait()


  // // get new balances:
  // const newBal = await WETH.balanceOf(contractAddr)
  // console.log(newBal/10**18)

  // return


  // // Transfer it out:

  // // Test for gas:
  // // const gas = await ethers.provider.getFeeData()
  // let bInfo = -1
  // // while((bInfo = await ethers.provider.getFeeData()).gasPrice > BigInt(ethers.utils.parseUnits("15", "gwei"))){
  // //   console.log('Gas too high', ethers.utils.formatUnits(bInfo.gasPrice, "gwei"))

  // //   console.log('Gas:', ethers.utils.formatUnits(bInfo.gasPrice, "gwei"), 
  // //     ethers.utils.formatUnits(BigInt(bInfo.gasPrice) * 1002n / 1000n, "gwei")
  // //   )

  // //   await new Promise((a)=>setTimeout(a, 3000))
  // // }
  // // console.log(ethers.utils.formatUnits(bInfo, "gwei"))


  // // Do a transfer:
  // const tx = await WETH.transferFrom(contractAddr, destAcc, bal);
  // // const tx = await WETH.transferFrom(contractAddr, destAcc, bal, {
  // //   gasLimit: 30000,
  // //   gasPrice: ethers.utils.parseUnits("13", "gwei")
  // // });
  // console.log(tx);
  // const rcpt = await tx.wait()

  // console.log(rcpt)



  // // const feeData = await hre.ethers.provider.getFeeData()

  // // const Lock = await hre.ethers.getContractFactory("Slip");
  // // const lock = await Lock.deploy({ 
  // //   maxFeePerGas: feeData.maxFeePerGas
  // // });

  // // await lock.deployed();

  // // console.log(
  // //   `Slip deployed to ${lock.address}`
  // // );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});