const hre = require("hardhat");

async function main() {

 
  const CosmicMonkeyClub = await hre.ethers.getContractFactory("CosmicMonkeyClub");
  const cosmicmonkeyclub = await CosmicMonkeyClub.deploy("CosmicMonkeyClub","CMC","ipfs://QmXCjKofupADLpHRRbsCkEV9FUSJQKgZA8XCVjzmuk51H4/");
  await cosmicmonkeyclub.deployed();

  console.log("Ubited Lions deployed to:", cosmicmonkeyclub.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
