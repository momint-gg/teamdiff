require('dotenv').config({ path: '../.env' });
const { ethers } = require('ethers');
const abi = require('../contract_info/abis/LeagueMaker.json');
const { LeagueMaker } = require('../contract_info/contractAddresses');

async function main() {
  // Constructing our contract
  const provider = new ethers.providers.AlchemyProvider(
    'rinkeby',
    process.env.ALCHEMY_KEY
  );
  const rinkebySigner = new ethers.Wallet(process.env.OWNER_KEY, provider);
  const LeagueMakerCntract = new ethers.Contract(
    LeagueMaker,
    abi.abi,
    rinkebySigner
  );

  // Getting our list of proxies
  const leagueAddresses = await LeagueMakerCntract.connect(
    rinkebySigner
  ).getLeagueAddresses();

  // Creating interactable contract list of proxies
  AllLeagueInstances = []; // all of our leagues (as CONTRACTS) so we can interact with them
  let currProxy;
  for (let i = 0; i < leagueAddresses.length; i++) {
    currProxy = new ethers.Contract(
      leagueAddresses[i],
      LeagueOfLegendsLogicJSON.abi,
      provider
    );
    AllLeagueInstances.push(currProxy);
  }

  // Looping through all of our proxies
  let currLeague;
  let txn;
  for (let i = 0; i < AllLeagueInstances.length; i++) {
    currLeague = AllLeagueInstances[i].connect(rinkebySigner);
    txn = await currLeague.setLeagueSchedule();
    await txn.wait();
  }
}

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
