require("@nomiclabs/hardhat-waffle");
require('hardhat-contract-sizer');

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
      accounts:['0x1d6b6c63470e6329487625d6ca054b4d8c6eda2ca3f38d42fea529a9ed678983']
    },
    matic:{
      url:'https://rpc-mumbai.maticvigil.com/',
      accounts:['1d6b6c63470e6329487625d6ca054b4d8c6eda2ca3f38d42fea529a9ed678983'], 
      gas:2100000,
      gasPrice:8000000000
    }
  }
};
