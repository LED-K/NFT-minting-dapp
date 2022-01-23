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
// Go to https://hardhat.org/config/ to learn more

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
    },
    matic:{
      url:'https://rpc-mumbai.maticvigil.com/',
      accounts:[process.env.PRIVATE_KEY], 
      gas:2100000,
      gasPrice:8000000000
    }
  },
  etherscan: {
    apiKey: {
      mainnet: "6EQMQJ99I311RHAYH86PV3W6QEJ1KZS2W8",
      ropsten: "6EQMQJ99I311RHAYH86PV3W6QEJ1KZS2W8",
      polygon: "ZV4JFZ95563H8DJ1KQE2ZF3XE834YJPJ2Y",
      polygonMumbai: "ZV4JFZ95563H8DJ1KQE2ZF3XE834YJPJ2Y",


    }
  }
};
