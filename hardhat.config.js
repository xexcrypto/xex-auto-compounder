require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
// require("@nomicfoundation/hardhat-verify");

// require('hardhat-deploy');

require('./tasks/accounts')
require('./tasks/deploy')
require('./tasks/setVaultOnStrat')
require('./tasks/verifyPool')



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  networks: {
    // ETHEREUM::
    // hardhat: {
    //   // chainId: 1337,
    //   chainId: 1,
    //   gasPrice: 225000000000,
    //   forking: {
    //     url: 'https://rpc.ankr.com/eth/0799f87f6f659a3c3805a39de574b9cba88c91f2bc3af3b7dcc978b60f421623',
    //     // blockNumber: 31890832, //31632109,
    //     // accounts: [process.env['TESTKP']],
    //     live: false,
    //     // saveDeployments: true,
    //   },
    //   allowUnlimitedContractSize: true,
    // },

    // AVALANCHE::
    hardhat: {
      // chainId: 1337,
      chainId: 43114,
      gasPrice: 225000000000,
      forking: {
        url: `https://api.avax.network/ext/bc/C/rpc`,
        blockNumber: 32380120, //31890832, //31632109,
        accounts: [process.env['TESTKP']],
        live: false,
        // saveDeployments: true,
      },
      // allowUnlimitedContractSize: true,
    },
    localnet: {
      chainId: 43114,
      gasPrice: 225000000000,
      url: "http://127.0.0.1:8545"
    },
    // ganache: {
    //   url: "http://127.0.0.1:8545",
    //   accounts: [
    //     `1f75a17a08287c8cea6fdd90856b3f741382dab4552880461a23ac2adf422524`,
    //   ],
    // }
    avaxtestnet: {
      chainId: 43113,
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      //gasPrice: 225000000000,
      accounts: [process.env.TESTKP]
    },
    avaxmainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      //gasPrice: 225000000000,
      accounts: [process.env.DEPLOY_KEY, process.env.PERSONAL_KEY]
    },

    // ethereumfork: {
    //   chainId: 1,
    //   //url: "https://rpc.ankr.com/eth/0799f87f6f659a3c3805a39de574b9cba88c91f2bc3af3b7dcc978b60f421623"
    //   forking: {
    //     url: 'https://rpc.ankr.com/eth/0799f87f6f659a3c3805a39de574b9cba88c91f2bc3af3b7dcc978b60f421623',
    //     // blockNumber: 31890832, //31632109,
    //     accounts: [process.env['TESTKP']],
    //     live: false,
    //     // saveDeployments: true,
    //   },
    // },
    ethereummainnet: {
      url: "https://rpc.ankr.com/eth/0799f87f6f659a3c3805a39de574b9cba88c91f2bc3af3b7dcc978b60f421623"
    }

  },
  gasReporter: {
    enabled: true, //(process.env.REPORT_GAS) ? true : false
    coinmarketcap: "3ec57881-4afb-4505-8080-28460bd78354",
    token: 'AVAX'
  },
  etherscan: {
    apiKey: process.env.SNOWTRACE_API_KEY,
    apiUrl: "https://api.snowtrace.io",
    browserURL: "https://snowtrace.io/",
  },
  namedAccounts: {
    deployer: {
        default: '0x945d659DdeE7D5E229EEf50C9ad3b6A4A18A2964', // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        4: '0xA296a3d5F026953e17F472B497eC29a5631FB51B', // but for rinkeby it will be a specific address
        "goerli": '0x84b9514E013710b9dD0811c9Fe46b837a4A0d8E0', //it can also specify a specific netwotk name (specified in hardhat.config.js)
    },
    // feeCollector:{
    //     default: 1, // here this will by default take the second account as feeCollector (so in the test this will be a different account than the deployer)
    //     1: '0xa5610E1f289DbDe94F3428A9df22E8B518f65751', // on the mainnet the feeCollector could be a multi sig
    //     4: '0xa250ac77360d4e837a13628bC828a2aDf7BabfB3', // on rinkeby it could be another account
    // }
}
};
