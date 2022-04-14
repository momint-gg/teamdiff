const { expect } = require("chai");
const hre = require("hardhat");
const LeagueOfLegendsLogicJSON = require("../../build/contracts/contracts/LeagueOfLegendsLogic.sol/LeagueOfLegendsLogic.json");

describe("LeagueOfLegendsLogic.test", async () => {

  // Ran before first unit test
  before(async () => {
    //Create MOBA Logic Library instance
    const MOBALogicLibraryFactory = await ethers.getContractFactory("MOBALogicLibrary");
    const MOBALogicLibraryInstance = await MOBALogicLibraryFactory.deploy();
    await MOBALogicLibraryInstance.deployed();
    console.log("MOBALogicLibrary deployed to:", MOBALogicLibraryInstance.address);

    //Create League Maker Library Instance
    const LeagueMakerLibraryFactory = await ethers.getContractFactory("LeagueMakerLibrary");
    const LeagueMakerLibraryInstance = await LeagueMakerLibraryFactory.deploy();
    await LeagueMakerLibraryInstance.deployed();
    console.log("LeagueMakerLibrary deployed to:", LeagueMakerLibraryInstance.address);
    
    //Create Game Logic Instance
    const LeagueOfLegendsLogicFactory = await ethers.getContractFactory("LeagueOfLegendsLogic",{
        libraries: {
          MOBALogicLibrary: MOBALogicLibraryInstance.address,
        }
      });
    const LeagueOfLegendsLogicInstance = await LeagueOfLegendsLogicFactory.deploy();
    await LeagueOfLegendsLogicInstance.deployed();
    console.log("LeagueOfLegendsLogic deployed to:", LeagueOfLegendsLogicInstance.address);

    //Create League Maker INstance
    const LeagueMakerFactory = await ethers.getContractFactory("LeagueMaker", {
      libraries: {
        LeagueMakerLibrary: LeagueMakerLibraryInstance.address,
      }
    });

    const LeagueMakerInstance = await LeagueMakerFactory.deploy(
      LeagueOfLegendsLogicInstance.address
    );
    await LeagueMakerInstance.deployed();
    console.log("LeageMaker deployed to:", LeagueMakerInstance.address);

    //Create Beacon Instance
    const BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
    const BeaconInstance = await BeaconFactory.deploy(LeagueOfLegendsLogicInstance.address);
    await BeaconInstance.deployed();
    console.log("Beacon deployed to:", BeaconInstance.address);

    //Signers
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8] =
      await hre.ethers.getSigners();

    //Create One league proxy instances
    var txn = await LeagueMakerInstance.createLeague("best league", 10, true);
    var leagueProxyContractAddress;
    receipt = await txn.wait();
    for (const event of receipt.events) {
      if (event.event != null) {
        console.log(`Event ${event.event} with args ${event.args}`);
        leagueProxyContractAddress = event.args[1];
      }
    }

      //Creating a new contract instance wiht the abi and address (must test on rinkeby)
      const provider = new ethers.providers.getDefaultProvider();
      //const provider = new ethers.providers.AlchemyProvider("rinkeby", process.env.ALCHEMY_KEY)
      const LeagueProxyInstance = new ethers.Contract(
          leagueProxyContractAddress,
          LeagueOfLegendsLogicJSON.abi,
          provider
      );

    
  });

  // Ran before every unit test
  beforeEach(async () => {});


  /******************/
  /***TESTING *******/
  /******************/

  it("Owner is the LeagueMakerContract", async () => {
    expect(LeagueProxyInstance.owner()).to.equal(LeagueMakerInstance.address);
  });

  it("Admin is the user who created the league", async () => {
    
  });

  it("Admin cannot call onlyOwner functions", async () => {

  });

  it("Non-Admin cannot call admin functions", async () => {

  });

  it("non-whitelist user cannot join private league", async () => {

  });

  it("Maximum of 8 users can join league", async () => {

  });

  it("League schedule results in no back-to-back rematchs, duplicates, or no match", async () => {

  });

  it("User cannot join after league entry is closed", async () => {

  });

  it("User cannot set lineup after lineupIsLocked()", async () => {

  });

  it("Evaluate match correctly updates user record and user total wins", async () => {

  });

  /*
  it("Owner is the LeagueMakerContract", async () => {

  });

  it("Owner is the LeagueMakerContract", async () => {

  });

  it("Owner is the LeagueMakerContract", async () => {

  });
*/

  // We are testing with TestUSDC (made by me) because there is NO RINKEBY USDC ABI >:(
  it("Allows a user to stake USDC and is receieved by the contract when user joins league", async () => {
    // const rinkebyUSDCToken = new ethers.Contract('0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b', json_file.abi ,owner)

    // Approving the transaction first
    // Passing in the LEAGUE CONTRACT as the first param, amount as the second *** (important)
    // Need to approve spending for the contract, in UI will have metamask popup to approve transaction
    let approval = await usdcContract
      .connect(owner)
      .approve(contract.address, 10);
    await approval.wait();

    let txn = await contract.connect(owner).joinLeagueAndStake();
    await txn.wait();

    const balance = await contract.getUSDCBalance();
    expect(balance).to.equal(10);
  });

  it("Allows another user (addr1) with >= 10 USDC to join the league", async () => {
    let approval = await usdcContract
      .connect(addr1)
      .approve(contract.address, 10);
    await approval.wait();

    let txn = await contract.connect(addr1).joinLeagueAndStake();
    await txn.wait();

    const usersLen = await contract.getUsersLength();
    // Expecting 2 users now in the users array
    expect(Number(usersLen)).to.equal(2);
  });

  it("Correctly sets athlete IDs and gets a user's lineup", async () => {
    const athleteIds = [0, 1, 3, 5, 7]; // Athlete IDs for user 1 (owner)
    const athleteIds2 = [2, 4, 6, 8, 9]; // Athlete IDs for user 2 (addr1)

    let txn = await contract.connect(owner).setLineup(athleteIds);
    await txn.wait();

    txn = await contract.connect(addr1).setLineup(athleteIds2);
    await txn.wait();

    const lineup = await contract.connect(owner).getLineup(); // Getting the caller's lineup
    // console.log("Lineup for owner is ", lineup);
    await contract.connect(addr1);
    const lineup2 = await contract.connect(addr1).getLineup();
    // console.log("Lineup for addr1 is ", lineup2);
    expect(lineup).to.not.equal(lineup2);
  });

  // Basically the whole test for league functionality
  // If this works we chillllllllllin baby
  it("Correctly evaluates a matchup", async () => {
    // First adding stats for first 10 athletes (0-9)
    console.log("In test");
    for (let i = 0; i < 10; i++) {
      const randomNum = Math.floor(Math.random() * 5 + 1); // In range (1,5)
      let txn = await athleteContract.connect(owner).appendStats(i, randomNum);
      await txn.wait();
    }
    // Setting address of our athlete contract
    let txn = await contract.setAthleteContractAddress(athleteContract.address);
    await txn.wait();

    txn = await contract.evaluateMatch(owner.address, addr1.address);
    await txn.wait();

    txn = await contract.connect(owner).getUserTotalPts();
    console.log("Weekly pts fow owner ", Number(txn));
    txn = await contract.connect(addr1).getUserTotalPts();
    console.log("Weekly pts for addr1 ", Number(txn));
  });
});
