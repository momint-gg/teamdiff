// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Athletes.sol";
import "./Whitelist.sol";
import "./TestUSDC.sol";

contract League is Ownable {
    using SafeMath for uint256;

    // Vars
    uint256 numWeeks = 8; // Length of a split
    uint256 leagueSize = 8; // For testing
    uint256 currentWeekNum; // Keeping track of week number

    // Note for addresses: If invalid checksum, check cases
    // address rinkebyUSDCAddress = 0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b;
    address polygonUSDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // When we deploy to mainnet

    mapping(address => uint256) userToTotalPts;
    mapping(address => uint256[]) userToWeeklyPts;
    mapping(address => uint256[]) userLineup;

    // Our league's users
    // Reminder: We are inheriting the add / remove from whitelist functions from Whitelist.sol
    address[] users; // All of our leagues users
    address creator; // This will be set initially
    uint256 stakeAmount; // Amount that will be staked (in USDC) for each league
    uint256 private _totalSupply; // Total supply of USDC

    //Events
    event Staked(address sender, uint256 amount);

    // Our Athletes.sol contract
    Athletes athletesContract;
    // Our Whitelist contract
    Whitelist whitelistContract;
    // Test USDC
    TestUSDC testUSDC;

    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]

    constructor(uint256 _stakeAmount, address _testUSDCAddress) {
        console.log("ADDY is ", _testUSDCAddress);
        testUSDC = TestUSDC(_testUSDCAddress); // Deploying test USDC
        stakeAmount = _stakeAmount; // Converting to USDC decimal storage (stored as 10^6)
        whitelistContract = new Whitelist(); // Initializing our whitelist
    }

    // User joining the league and staking the league's currency amount
    // Add modifier for only whitelisted
    // I think this means they won't be able to stake decimal amounts
    function joinLeagueAndStake() public payable {
        users.push(msg.sender);
        // Note: this will fail if allowance is not high enough (set through token.approve())
        // Todo for mainnet: replace transferFrom staement with commented out (remember to prompt for approval of transaction on frontend!)
        // IERC20(polygonUSDCAddress).transferFrom(msg.sender, address(this), stakeAmount)

        testUSDC.transferFrom(msg.sender, address(this), stakeAmount);
        emit Staked(msg.sender, stakeAmount);
    }

    // Returning the contracts USDC balance
    function getUSDCBalance() public view returns (uint256) {
        // Todo for mainnet: replace return statement with the commented out statement
        // return IERC20(polygonUSDCAddress).balanceOf(address(this));

        return testUSDC.balanceOf(address(this));
    }

    // Returning the sender's USDC balance (testing)
    function getUserUSDCBalance() public view returns (uint256) {
        // Todo for mainnet: replace return statement with the commented out statement
        // return IERC20(polygonUSDCAddress).balanceOf(msg.sender);

        return testUSDC.balanceOf(msg.sender);
    }

    // TODO: Should we write this or just make it so that you can't leave once you join?
    function removeFromLeague() public onlyOwner {}

    // Evaluating a match between two users (addresses)
    // Returns which user won
    function evaluateMatch(address addr1, address addr2)
        public
        onlyOwner
        returns (address)
    {
        uint256[] memory lineup1 = userLineup[addr1];
        uint256[] memory lineup2 = userLineup[addr2];
        uint256 addr1Score;
        uint256 addr2Score;

        // Calculating users' total scores
        for (uint256 i = 0; i < lineup1.length; i++) {
            // Calling the Athletes.sol contract to get the scores of ith athlete
            uint256[] memory currAthleteScores1 = athletesContract
                .getAthleteScores(lineup1[i]);
            uint256[] memory currAthleteScores2 = athletesContract
                .getAthleteScores(lineup2[i]);
            // Getting the last score in the array
            uint256 latestScore1 = currAthleteScores1[
                currAthleteScores1.length - 1
            ];
            uint256 latestScore2 = currAthleteScores2[
                currAthleteScores2.length - 1
            ];

            if (latestScore1 > latestScore2) {
                addr1Score += 1;
            } else {
                addr2Score += 1;
            }
        }
        // Incrementing week #
        currentWeekNum += 1;
        // Updating mappings and returning the winner
        if (addr1Score > addr2Score) {
            userToWeeklyPts[addr1].push(1);
            userToWeeklyPts[addr2].push(0);
            userToTotalPts[addr1] += 1;
            return addr1;
        } else {
            userToWeeklyPts[addr2].push(1);
            userToWeeklyPts[addr1].push(0);
            userToTotalPts[addr2] += 1;
            return addr2;
        }
    }

    // Setting the lineup for a user
    function setLineup(uint256[] memory athleteIds) public {
        userLineup[msg.sender] = athleteIds;
    }

    // Returning the lineup for a user
    function getLineup() public view returns (uint256[] memory) {
        return userLineup[msg.sender];
    }

    // Sets the initial schedule for the league -- this will be done off chain
    // Will figure out exact way to pass in params later once Isaiah is done
    function setLeagueSchedule() public onlyOwner {}

    // Setting the address for our athlete contract
    function setAthleteContractAddress(address _athleteContractAddress)
        public
        onlyOwner
    {
        athletesContract = Athletes(_athleteContractAddress);
    }

    // Getter for user to total pts
    function getUserTotalPts() public view returns (uint256) {
        return userToTotalPts[msg.sender];
    }

    // Getter for user to weekly pts
    function getUserWeeklypts() public view returns (uint256[] memory) {
        return userToWeeklyPts[msg.sender];
    }
}
