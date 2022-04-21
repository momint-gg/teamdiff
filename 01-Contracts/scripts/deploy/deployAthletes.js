const main = async () => {
  const AthletesContractFactory = await hre.ethers.getContractFactory(
    "Athletes"
  );
  const AthletesContract = await AthletesContractFactory.deploy();
  await AthletesContract.deployed();

  console.log("Contract deployed to:", AthletesContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();

//Latest contract address (rinkeby) --> 0x94b90ca07014F8B67A6bCa8b1b7313d5fD8D2160 (created 2/10 4pm)
