require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-truffle5');
require('hardhat-contract-sizer');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.0',
  paths: {
    artifacts: './src/artifacts',
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 2000,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    //Config for Rinkeby
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/' + process.env.ALCHEMY_KEY, //our alchemy key -- message me (Henry) for this
      accounts: [process.env.PRIVATE_KEY], //Insert your metamask private key
    },
  },
  mocha: {
    //for testing
    timeout: 500000000,
  },
  gasReporter: {
    //getting gas for testing
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
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
