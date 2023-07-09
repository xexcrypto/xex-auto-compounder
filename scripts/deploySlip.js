
const main = async () => {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const unlockTime = currentTimestampInSeconds + 60;

  // const lockedAmount = hre.ethers.utils.parseEther("0.001");

  const feeData = await hre.ethers.provider.getFeeData()

  const Lock = await hre.ethers.getContractFactory("Slip");
  const lock = await Lock.deploy({ 
    maxFeePerGas: feeData.maxFeePerGas
  });

  await lock.deployed();

  console.log(
    `Slip deployed to ${lock.address}`
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});