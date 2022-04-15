// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

import "./LeagueBeaconProxy.sol";
import "./Athletes.sol";
import "./LeagueMakerLibrary.sol";
import "./TestUSDC.sol";

contract LeagueMaker is Ownable {
    //To use Clone library
    //using Clones for address;

    // ======= Events ==========
    event LeagueCreated(string name, address a);
    event Response(bool success, bytes data);

    // ======== Immutable storage ========
    UpgradeableBeacon immutable upgradeableBeacon;
    // Athletes immutable athletesDataStorage;

    // For staking
    TestUSDC testUSDC;

    // ======== Mutable storage ========
    address beaconAddress;
    address[] public leagueAddresses; //list of all deployed leagueAddresses
    //Maps Users to all the leagues they are a member of
    mapping(address => address[]) public userToLeagueMap;
    uint256 version;
    uint256 numWeeks;

    //Proxy Constructor Parameters
    // struct Parameters {
    //     string name;
    //     uint256 version;
    //     uint256 numWeeks;
    //     uint256 stakeAmount;
    //     bool isPublic;
    //     address athletesDataStorageAddress;
    //     address owner;
    //     address admin;
    //     address polygonUSDCAddress;
    //     address rinkebyUSDCAddress;
    //     address testUSDCAddress;
    // }
    // Parameters public parameters;
    uint256 _numWeeks = 8;
    uint256 public currentWeek = 0;
    address _polygonUSDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // When we deploy to mainnet
    address _rinkebyUSDCAddress = 0xeb8f08a975Ab53E34D8a0330E0D34de942C95926;

    // ======== Constructor ========
    // the constructor deploys an initial version that will act as a template
    constructor(address _logic) {
        upgradeableBeacon = new UpgradeableBeacon(_logic);
        // athletesDataStorage = new Athletes(); // Moved to pass this in the create league function
        testUSDC = new TestUSDC(); //will take this out for mainnet, but need for staking
    }

    // ======== Deploy New League Proxy ========
    function createLeague(
        string calldata _name,
        uint256 _stakeAmount,
        bool _isPublic,
        address _adminAddress, // Need to pass it in here @Trey or it isn't set CORRECTLY
        address _testUSDCAddress, // Note: We will take this out once we deploy to mainnet (b/c will be using public ABI), but we need for now
        address _athletesContractAddress
    ) external returns (address) {
        bytes memory delegateCallData = abi.encodeWithSignature(
            "initialize(string,uint256,uint256,bool,address,address,address,address,address,address)",
            _name,
            //_version,
            _numWeeks,
            _stakeAmount,
            _isPublic,
            _athletesContractAddress,
            _adminAddress,
            _polygonUSDCAddress,
            _rinkebyUSDCAddress,
            _testUSDCAddress,
            address(this)
        );

        LeagueBeaconProxy proxy = new LeagueBeaconProxy(
            address(upgradeableBeacon),
            delegateCallData
        );

        leagueAddresses.push(address(proxy));

        emit LeagueCreated(_name, address(proxy));
        // delete parameters;
        return address(proxy);
    }

    //Create onlyOwner function to update week
    function incrementCurrentWeek() public onlyOwner {
        //TODO Must update the current week for all proxys
        currentWeek += 1;
    }

    //TODO set to only owner,
    //owner will be our Team Diff wallet
    //Set all schedules for all leagues
    function setLeagueSchedules() public onlyOwner {
        console.log("setting league schedule in leaguemaker");
        LeagueMakerLibrary.setLeagueSchedules(leagueAddresses);
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("setLeagueSchedule()")
            );
            emit Response(success, data);
        }
    }

    //Locking lineups for all leagues
    //TODO set to only owner
    //Locks the league Members for all leagues, so nobody new can join or leave
    function lockLeagueMembership() public onlyOwner {
        LeagueMakerLibrary.lockLeagueMembership(leagueAddresses);
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("setLeagueEntryIsClosed()")
            );
            emit Response(success, data);
        }
    }

    //Locks all the leagues lineups, so you cannot change players after a certain point in the weeek
    //TODO set to only owner
    function lockLeagueLineups() public onlyOwner {
        LeagueMakerLibrary.lockLeagueLineups(leagueAddresses);
    }

    // function lockLeagueLineups() public onlyOwner {
    //     bool success;
    //     bytes memory data;
    //     for (uint256 i = 0; i < leagueAddresses.length; i++) {
    //         (success, data) = leagueAddresses[i].call(
    //             abi.encodeWithSignature("lockLineup()")
    //         );
    //         emit Response(success, data);
    //     }
    // }

    //Unlocking lineups for all leagues
    //TODO set to only owner
    function unlockLeagueLineups() public onlyOwner {
        LeagueMakerLibrary.unlockLeagueLineups(leagueAddresses);
    }

    //Evaluates weekly scores for all matchups in all leagues
    function evaluateWeekForAllLeagues() public onlyOwner {
        LeagueMakerLibrary.evaluateWeekForAllLeagues(
            leagueAddresses,
            currentWeek
        );
    }

    //TODO set to onlyProxy
    //May need to create new access control privilege here
    //Add or update userToLeagueMapping with additional pairs
    function updateUserToLeagueMapping(address user) external {
        userToLeagueMap[user].push(msg.sender);
    }

    //TODO remove for prod
    // function setBeacon(address logic) external returns (address) {
    //     //parameters = Parameters({name: _name});
    //     UpgradeableBeacon newBeacon = new UpgradeableBeacon(logic);
    //     //delete parameters;
    //     beaconAddress = address(newBeacon);
    //     return address(newBeacon);
    // }
}
