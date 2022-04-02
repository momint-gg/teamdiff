//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Athletes.sol";
import "./Whitelist.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract League is Ownable, Athletes, Whitelist {
    using SafeMath for uint256;

    // Vars
    uint256 numWeeks = 8; // Length of a split
    uint256 leagueSize = 8; // For testing
    uint256 currentWeekNum; // Keeping track of week number
    address polygonUSDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // When we deploy to mainnet
    address rinkebyUSDCAddress = 0xeb8f08a975Ab53E34D8a0330E0D34de942C95926;

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

    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]

    constructor(address _creator, uint256 _stakeAmount) {
        creator = _creator;
        stakeAmount = _stakeAmount;
        whitelistContract = new Whitelist(_creator); // Initializing our whitelist
    }

    // Whoever calls this will become the league creator, and set the stake amount
    // Maybe add this to the proxy constructor? --> We need THIS to be called when a new proxy is created @Trey
    // The owner of the contract should be automatically set to "creator"
    // If testing: Make sure you have rinkeby USDC in your account
    function newLeagueSetup(uint256 _stakeAmount) public onlyCreator {
        // Before calling this function, make sure to set creator address as the owner
        addAddressToWhitelist(msg.sender);
        users.push(msg.sender);
        stakeAmount = _stakeAmount;
        stake(rinkebyUSDCAddress, stakeAmount);
    }

    // User joining the league
    function joinLeague() public onlyWhitelisted {
        users.push(msg.sender); // Maybe change this later to a map if it's gas inefficient as an array
        stake(rinkebyUSDCAddress, stakeAmount);
    }

    // User staking the currency
    // I think this means they won't be able to stake decimal amounts
    function stake(address _token, uint256 amount) internal {
        require(amount > 0, "Cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        // _balances[msg.sender] = _balances[msg.sender].add(amount);
        // Before this you should have approved the amount
        // This will transfer the amount of  _token from caller to contract
        IERC20(_token).transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    // TODO: Should we write this or just make it so that you can't leave once you join?
    function removeFromLeague() public onlyWhitelisted {}

    // Evaluating a match between two users (addresses)
    // Returns which user won
    // TODO: Event emitted for each user matchup
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

    // Returning the contracts USDC balance
    function getUSDCBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    //TODO
    //1.) View function to calculate score on-chain for a given line-up and week
    //2.) Pool Prize mechanics
    //3.) League membership mechanics
    //4.) League schedule creation mechanics
    //5.) lock set line-up with onlyOwner function

    //TODO Henry:
    // Add whitelist logic
    // List of users that can join league, if you join the league
    // When user joins league they pay an amount set by the league admin (payable function)
    // Amount is in USDC
    // Initially set by the league owner, cannot be reset
    // If user is whitelisted, then they can join the league
    // If whitelist has a length of 0 then ignore whitelist, anyone can join the league

    // Start prize pool mechanics
}
