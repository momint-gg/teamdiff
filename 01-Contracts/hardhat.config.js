const { task } = require("hardhat/config");

require("dotenv").config();
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-ethers");
// require("solidity-coverage");

const prodFunctions = require("./scripts/prodFunctions");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// Passing in task args: --named <name of function> --network <network to run on> (network is default)
task(
  "runproxyfunc",
  "Running functions that will be run on all proxies",
  async (taskArgs, hre) => {
    const name = taskArgs.name;
  }
);

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      { version: "^0.8.0" },
      { version: "0.8.2" },
      { version: "0.8.7" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  //solidity: "^0.8.0",
  paths: {
    //Need to add path so contract can verify correctly on etherscan
    artifacts: "./build/contracts",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // url: "http://127.0.0.1:8545",
      //gas: "auto",
      // chainId: 31337,
      // accounts: [process.env.HARDHAT_PRIVATE_KEY],
    },
    //Config for Rinkeby
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/" + process.env.ALCHEMY_KEY, //our alchemy key -- message me (Henry) for this
      accounts: [process.env.PRIVATE_KEY], //Insert your metamask private key,
      // gas: 2100000, // fixing cannot estimate gas error in League test
      // gasPrice: 8000000000,
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545"
    // },
  },
  mocha: {
    //for testing
    timeout: 500000000,
  },
  gasReporter: {
    //getting gas for testing
    currency: "USD",
    gasPrice: 21,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
