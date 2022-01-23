require("@nomiclabs/hardhat-waffle");
require('hardhat-contract-sizer');
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more --

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.7",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  paths:{
    artifacts: './src/artifacts'
  },
  networks:{
    ropsten:{
      url:'https://ropsten.infura.io/v3/81624675d02a4e0691fc26083e7615e1',
      accounts:[process.env.PRIVATE_KEY],
      gas:3100000,
      gasPrice:9000000000
    },
    mumbai:{
      url:'https://matic-mumbai.chainstacklabs.com',
      accounts: [process.env.PRIVATE_KEY], 
      gas:3100000,
      gasPrice:9000000000
    }
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYSCAN_API_KEY,
      polygonMumbai: process.env.POLYSCAN_API_KEY,


    }
  }
};
