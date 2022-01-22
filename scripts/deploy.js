const hre = require("hardhat");

async function main() {
 
  const Contract = await hre.ethers.getContractFactory("CosmicMonkeyClub");
  const contract = await Contract.deploy("Cosmic Monkey Club","CMC","https://bafybeifitw5hc2uuysrogjj6fl6ptwftmrrrxwueahzq47wwhusyuaiywy.ipfs.infura-ipfs.io/");
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
