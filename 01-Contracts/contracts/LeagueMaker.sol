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
    event LeagueCreated(
        string name,
        address proxyAddress,
        address proxyAdminAddress
    );
    event Response(bool success, bytes data);

    // ======== Immutable storage ========
    UpgradeableBeacon immutable upgradeableBeacon;

    // For staking
    TestUSDC testUSDC;

    // ======== Mutable storage ========
    address beaconAddress;
    address[] public leagueAddresses; //list of all deployed leagueAddresses
    //Maps Users to all the leagues they are a member of
    mapping(address => address[]) public userToLeagueMap;
    mapping(address => bool) public isProxyMap;
    uint256 numWeeks;

    uint256 _numWeeks = 8;
    uint256 public currentWeek = 0;
    address _polygonUSDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // When we deploy to mainnet
    address _rinkebyUSDCAddress = 0xeb8f08a975Ab53E34D8a0330E0D34de942C95926;

    address leagueMakerLibraryAddress; // Our LeagueMakerLibrary CONTRACT
    LeagueMakerLibrary leagueMakerLibrary; // Tring another method -- calling directly from LeagueMakerLibrary (enough storage?)

    // ======== Constructor ========
    // the constructor deploys an initial version that will act as a template
    constructor(address _logic, address _leagueMakerLibrary) {
        upgradeableBeacon = new UpgradeableBeacon(_logic);
        leagueMakerLibraryAddress = _leagueMakerLibrary;
        leagueMakerLibrary = LeagueMakerLibrary(_leagueMakerLibrary);
    }

    // ======== Deploy New League Proxy ========
    function createLeague(
        string calldata _name,
        uint256 _stakeAmount,
        bool _isPublic,
        address _adminAddress, // Need to pass it in here @Trey or it isn't set CORRECTLY
        address _testUSDCAddress, // Note: We will take this out once we deploy to mainnet (b/c will be using public ABI), but we need for now
        address _athletesContractAddress
    )
        external
        returns (
            //address _gameItemsAddress
            address
        )
    {
        bytes memory delegateCallData = abi.encodeWithSignature(
            "initialize(string,uint256,bool,address,address,address,address,address,address,address)",
            _name,
            //_version,
            //_numWeeks,
            _stakeAmount,
            _isPublic,
            _athletesContractAddress,
            _adminAddress,
            _polygonUSDCAddress,
            _rinkebyUSDCAddress,
            _testUSDCAddress,
            leagueMakerLibraryAddress, // Adding in library address
            address(this)
            // _gameItemsAddress
        );

        LeagueBeaconProxy proxy = new LeagueBeaconProxy(
            address(upgradeableBeacon),
            delegateCallData
        );

        leagueAddresses.push(address(proxy));
        userToLeagueMap[_adminAddress].push(address(proxy));
        isProxyMap[address(proxy)] = true;

        emit LeagueCreated(_name, address(proxy), _adminAddress);
        // delete parameters;
        return address(proxy);
    }

    //TODO set to only owner,
    //owner will be our Team Diff wallet
    //Set all schedules for all leagues
    function setLeagueSchedules() public onlyOwner {
        // LeagueMakerLibrary.setLeagueSchedules(leagueAddresses); // This isn't doing anything
        bool success;
        bytes memory data;
        (success, data) = leagueMakerLibraryAddress.call(
            abi.encodeWithSignature(
                "setLeagueSchedules(address[])",
                leagueAddresses
            )
        );
        require(success, "Failed to call setLeagueSchedules() from library");
    }

    //Locking lineups for all leagues
    //TODO set to only owner
    //Locks the league Members for all leagues, so nobody new can join or leave
    function lockLeagueMembership() public onlyOwner {
        // LeagueMakerLibrary.lockLeagueMembership(leagueAddresses);
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("setLeagueEntryIsClosed()")
            );
            emit Response(success, data);
        }
        require(success, "Failed to call lockLeagueMembership() from library");
    }

    // Locks all the leagues lineups, so you cannot change players after a certain point in the weeek
    function lockLeagueLineups() public onlyOwner {
        // leagueMakerLibrary.lockLeagueLineups(leagueAddresses);
        // Instead of above, call this way:
        bool success;
        bytes memory data;
        (success, data) = leagueMakerLibraryAddress.call(
            abi.encodeWithSignature(
                "lockLeagueLineups(address[])",
                leagueAddresses
            )
        );
        require(success, "Failed to call lockLeagueLineups() from library");
    }

    //Unlocking lineups for all leagues
    //TODO set to only owner
    function unlockLeagueLineups() public onlyOwner {
        // LeagueMakerLibrary.unlockLeagueLineups(leagueAddresses);
        // bool success;
        // bytes memory data;
        // for (uint256 i = 0; i < leagueAddresses.length; i++) {
        //     (success, data) = leagueAddresses[i].call(
        //         abi.encodeWithSignature("unlockLineup()")
        //     );
        //     emit Response(success, data);
        // }
    }

    //Create onlyOwner function to update week
    // function incrementCurrentWeek() public onlyOwner {
    //     currentWeek += 1;
    // }

    //Evaluates weekly scores for all matchups in all leagues
    // function evaluateWeekForAllLeagues() public onlyOwner {
    //     LeagueMakerLibrary.evaluateWeekForAllLeagues(
    //         leagueAddresses,
    //         currentWeek
    //     );
    //     bool success;
    //     bytes memory data;
    //     for (uint256 i = 0; i < leagueAddresses.length; i++) {
    //         (success, data) = leagueAddresses[i].call(
    //             abi.encodeWithSignature(
    //                 "evaluateWeek(uint256)",
    //                 currentWeek + 1
    //             )
    //         );
    //         emit Response(success, data);
    //     }
    //     currentWeek++;
    // }

    function updateUserToLeagueMapping(address user) external {
        require(isProxyMap[msg.sender], "Caller is not a valid proxy address.");
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
