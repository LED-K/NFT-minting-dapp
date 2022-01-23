const hre = require("hardhat");
require("dotenv").config();

async function main() {
 
  const Contract = await hre.ethers.getContractFactory("CosmicMonkeyClub");
  const contract = await Contract.deploy(process.env.CONTRACT_NAME,process.env.CONTRACT_SYMBOL,process.env.CONTRACT_BASE_URI);
  await contract.deployed();
  console.log("Contract to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
