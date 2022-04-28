// If we want to write tests for the add athletes script
// Actually just making this a normal script instead of a test cuz fuck chai rn lol
// I'm also drunk a lil

const { ethers } = require('ethers');

const main = async () => {
  const contractAddress = '0xDC09Ef720986fe68fE9e453dD330f444c15a2360';

  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  contract = new ethers.Contract(contractAddress, abi.abi, rinkebySigner);

  let txn = await contract.getStats();
  await txn.wait();
  console.log(txn);
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
