const fs = require("fs");

module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {

  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();
  const chainId = await getChainId();

  console.log(chainId)

  // fund account:
  if (chainId == 43114){
    await network.provider.send("hardhat_setBalance", [
      deployer,
      ethers.utils.parseEther("10").toHexString(),
    ]);
  }

  // TEST: Create a new contract from Lock and attempt ot deploy:
  const lock = (await fs.promises.readFile('contracts/Lock.sol')).toString()
  await fs.promises.writeFile('contracts/LockNew.sol', lock.replace('contract Lock', 'contract LockNew'))

  // Run tests?
  // deployments.fix

  // Need to compile it:
  await run("compile")

  // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
  await deploy('GLCR-fBOMB', {
    from: deployer,
    gasLimit: 4000000,
    // contract: "StratGlcrX",
    contract: "Strategy",
    args: [
      '0xf9728ccE66d4128e76C86D9bBaC08fC2F3641A05',
      '0x642eb8CD5E96cc39d27954b22A1745Db5C153b98',
      '0xc5b8ce3c8c171d506deb069a6136a351ee1629dc',
      '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // fee token - WAVAX
      '0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce',
      '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // fee token - WAVAX
      '0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce',
      [
        { 
          from:"0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6", // glcr
          to: "0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce", 
          stable: false 
        }
      ],
      [
        { 
          from:"0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6", // glcr
          to: "0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce", 
          stable: false 
        }
      ],
      [
        { 
          from: '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', // glcr
          to: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',   // wavax
          stable: false 
        }
      ]
    ],
  });

  // await deploy('GLCR-fBOMB', {
  //   from: deployer,
  //   gasLimit: 4000000,
  //   // contract: "StratGlcrX",
  //   contract: "LockNew",
  //   args: [
  //     '0xf9728ccE66d4128e76C86D9bBaC08fC2F3641A05',
  //     '0x642eb8CD5E96cc39d27954b22A1745Db5C153b98',
  //     '0xc5b8ce3c8c171d506deb069a6136a351ee1629dc',
  //     '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // fee token - WAVAX
  //     '0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce',
  //     [
  //       { 
  //         from:"0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6", // glcr
  //         to: "0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce", 
  //         stable: false 
  //       }
  //     ],
  //     [
  //       { 
  //         from: '0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6', // glcr
  //         to: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',   // wavax
  //         stable: false 
  //       }
  //     ]
  //   ],
  // });
};