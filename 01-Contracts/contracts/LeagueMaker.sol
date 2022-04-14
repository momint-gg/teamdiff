// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

import "./LeagueBeaconProxy.sol";
import "./Athletes.sol";
import "./LeagueMakerLibrary.sol";


contract LeagueMaker is Ownable {

    // ======= Events ==========
    event LeagueCreated(string name, address a);
    event Response(bool success, bytes data);

    // ======== Immutable storage ========
    UpgradeableBeacon immutable upgradeableBeacon;
    Athletes immutable athletesDataStorage;
    

    // ======== Mutable storage ========
    address beaconAddress;
    address[] public leagueAddresses; //list of all deployed leagueAddresses
    //Maps Users to all the leagues they are a member of
    mapping(address => address[]) public userToLeagueMap;
    uint256 public currentWeek = 0;
    address _polygonUSDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // When we deploy to mainnet
    address _rinkebyUSDCAddress = 0xeb8f08a975Ab53E34D8a0330E0D34de942C95926;

    // ======== Constructor ========
    // the constructor deploys an initial version that will act as a template
    constructor(address _logic) {
        upgradeableBeacon = new UpgradeableBeacon(_logic);
        athletesDataStorage = new Athletes();
    }

    // ======== Deploy New League Proxy ========
    function createLeague(
        string calldata _name,
        uint256 _stakeAmount,
        bool _isPublic
        )
        external
        returns ( address )
    {
        bytes memory delegateCallData = abi.encodeWithSignature(
            "initialize(string,uint256,uint256,bool,address,address,address,address,address)",
            _name, 
            _stakeAmount,
            _isPublic,
            address(athletesDataStorage),
            msg.sender,
            _polygonUSDCAddress,
            _rinkebyUSDCAddress,
            address(this)
        );
        LeagueBeaconProxy proxy = new LeagueBeaconProxy(
            address(upgradeableBeacon),
            delegateCallData
        );

        leagueAddresses.push(address(proxy));
        
        
        emit LeagueCreated(_name, address(proxy));
        return address(proxy);
    }

    //Create onlyOwner function to update week
    function incrementCurrentWeek() public onlyOwner {
        currentWeek += 1;
    }

    //TODO set to only owner,
        //owner will be our Team Diff wallet
    //Set all schedules for all leagues 
    function setLeagueSchedules() public onlyOwner {
        LeagueMakerLibrary.setLeagueSchedules(leagueAddresses);
    }

    //Locking lineups for all leagues
    //TODO set to only owner
    //Locks the league Members for all leagues, so nobody new can join or leave
    function lockLeagueMembership() public onlyOwner {
        LeagueMakerLibrary.lockLeagueMembership(leagueAddresses);
    }

    //Locks all the leagues lineups, so you cannot change players after a certain point in the weeek
    //TODO set to only owner
    function lockLeagueLineups() public  onlyOwner{
        LeagueMakerLibrary.lockLeagueLineups(leagueAddresses);
    }

    //Unlocking lineups for all leagues
    //TODO set to only owner
    function unlockLeagueLineups() public onlyOwner{
        LeagueMakerLibrary.unlockLeagueLineups(leagueAddresses);
    }

    //Evaluates weekly scores for all matchups in all leagues
    function evaluateWeekForAllLeagues() public onlyOwner{
        LeagueMakerLibrary.evaluateWeekForAllLeagues(leagueAddresses, currentWeek);
    }

    //TODO set to onlyProxy
        //May need to create new access control privilege here
    //Add or update userToLeagueMapping with additional pairs
    function updateUserToLeagueMapping(address user) external {
        userToLeagueMap[user].push(msg.sender);
    }

    function setBeacon(address logic) external returns (address) {
        //parameters = Parameters({name: _name});
        UpgradeableBeacon newBeacon = new UpgradeableBeacon(logic);
        //delete parameters;
        beaconAddress = address(newBeacon);
        return address(newBeacon);
    }


}
