// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// //Use upgradeable open-zeppelin packages for easier testing with hardhat and truffle
// import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol";
// import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
// import "@openzeppelin/contracts/proxy/Proxy.sol";
// import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

import "./LeagueBeaconProxy.sol";
import "./Athletes.sol";

//import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
//OPEN ISSUES
// should we use a beacon implementation, or a single logic contract implementation
//I believe a beacon design looks like
// BeaconProxy --> UpgradeableBecon --> Logic Contract
// where beacon proxy is a proxy contract that delgates calls to upgradeuable Beacon,
// and upgradeable beacon is another proxy that delegates to logic contract
// therefore upgrading a Upgradeable beacon will upgrade all the proxies that point to that beacon
// Question, can users still call upgradeTo() and change the implementation to a non-UpgradeableBeacon contract?
//NO, if leagues are deployed as BeaconPRoxies, they must delegate calls to a contract that implements UpgradeableBeacon, I believe
//So this would stifle customizabaility
//We could have multiple beacons with different rule sets though
//More CONS
//BeaconProxy is not compatible with the Upgradeable openzeppelin api yet
//IDK how important this is honestly
//THis is slightly harder to implement it feels like, and harder to test
//*************  OR  **************/
//We could use a single logic contract that every newly deployed Upgradeable Proxy points too
//however, to upgrade all proxies, we would have to iterate over each LEagueProxy contract, and call the _upgradeTo(impl) function to update to the new logic contract
//This would also require that we have admin privileges for each LeaguePRoxy contract to call the upgradeTo() function
// I like this approach for V1, can easily change how leagues are deploye in V2, although season 1 stats might be lost.
//This is also simpler for now
// Also depends on what we want to do long term, like if we want users to be abel to point to their own implementaiton contract,
//or choose from a list of pre-written contracts that we make

//CONSTANTS
//Implementation Contract Address

//This hi-keyyyy doesn't need to be upgradeable lol
// contract LeagueProxy is ERC1967UpgradeUpgradeable/*, UUPSUpgradeable, OwnableUpgradeable*/ {
//TODO must add owner
contract LeagueMaker {
    //To use Clone library
    using Clones for address;


    // ======= Events ==========
    event LeagueCreated(string name, address a);
    event cloneCreated(address clone);
    event Response(bool success, bytes data);

    // ======== Immutable storage ========
    // upgradeable beacon
    UpgradeableBeacon immutable upgradeableBeacon;
    Athletes immutable athletesDataStorage;
    

    // ======== Mutable storage ========
    address beaconAddress;
    address[] public leagueAddresses; //list of all deployed leagueAddresses
    //TODO how can we tell what league a user belongs to?
    //Honestly might be easiest to give them a membership nft :/
    mapping(address => address[]) public userToLeagueMap;

    //Proxy Constructor Parameters
    struct Parameters {
        string name;
        uint256 version;
        uint256 numWeeks;
        uint256 stakeAmount;
        address athletesDataStorageAddress;
        address owner;
        address admin;
        address polygonUSDCAddress;
        address rinkebyUSDCAddress;        
    }
    Parameters public parameters;
    uint256 _version = 0;
    uint256 _numWeeks = 8; // Length of a split
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
        uint256 _stakeAmount
        )
        external
        returns ( address )
    {
        parameters = Parameters({
            name: _name, 
            version: _version,
            numWeeks: _numWeeks,
            stakeAmount: _stakeAmount,
            athletesDataStorageAddress: address(athletesDataStorage),
            owner: address(this),
            admin: msg.sender,
            polygonUSDCAddress: _polygonUSDCAddress,
            rinkebyUSDCAddress: _rinkebyUSDCAddress
        });
        //TODO memory clean-up should be done
        bytes memory delegateCallData = abi.encodeWithSignature(
            "initialize(string,uint256,uint256,uint256,address,address,address,address,address,address)",
            parameters.name,
            parameters.version,
            parameters.numWeeks,
            parameters.stakeAmount,
            parameters.athletesDataStorageAddress,
            parameters.owner,
            parameters.admin,
            parameters.polygonUSDCAddress,
            parameters.rinkebyUSDCAddress,
            address(this)
        );
        LeagueBeaconProxy proxy = new LeagueBeaconProxy(
            address(upgradeableBeacon),
            delegateCallData
        );

        leagueAddresses.push(address(proxy));
        
        
        emit LeagueCreated(parameters.name, address(proxy));
        delete parameters;
        return address(proxy);
    }

    //Create onlyOwner function to update week
    

    //TODO set to only admin,
    //Set all schedules for all leagues 
    function setLeagueSchedules() public {
        bool success;
        bytes memory data;
        for(uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("setLeagueSchedule()")
            );
            emit Response(success, data);

        }
    }

    //Locking lineups for all leagues
    //TODO set to only owner
    function lockLeagueLineups() public  {
        bool success;
        bytes memory data;
        for(uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("lockLineup()")
            );
            emit Response(success, data);
        }
    }

    //Unlocking lineups for all leagues
    //TODO set to only owner
    function unlockLeagueLineups() public {
        bool success;
        bytes memory data;
        for(uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("unlockLineup()")
            );
            emit Response(success, data);

        }
    }

    function evaluateAllWeeks() public {
        bool success;
        bytes memory data;
        for(uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("evaluateMatch(uint)"),
                currentWeek
            );
            emit Response(success, data);
        }
    }

    //TODO set to onlyProxy
    //Add or update userToLeagueMapping with additional pairs
    function updateUserToLeagueMapping(address user) external {
        userToLeagueMap[user].push(msg.sender);
    }



    // ============= Deploy Ligthweight clone ===========
    // function createLeagueClone(address implementation) external {
    //     //Try returning just a clone with the implementation address
    //     //return implementation.cloneDeterministic(msg.sender);
    //     address cloneAddy = implementation.clone();
    //     console.log(cloneAddy);
    //     emit cloneCreated(cloneAddy);
    //     //return cloneAddy;
    // }

    function setBeacon(address logic) external returns (address) {
        //parameters = Parameters({name: _name});
        UpgradeableBeacon newBeacon = new UpgradeableBeacon(logic);
        //delete parameters;
        beaconAddress = address(newBeacon);
        return address(newBeacon);
    }

    //Public getters for testing purposes
    // function getImplementation() public view returns (address) {
    //     return logic;
    // }

    function getBeacon() public view returns (address) {
        return address(upgradeableBeacon);
    }


    // Calling a function that does not exist triggers the fallback function.
    function testCallDoesNotExist(address _addr) public {
        //This calls the game logic incrementVersion which is great
        //but how do we call it in js?
        (bool success, bytes memory data) = _addr.call(
            abi.encodeWithSignature("incrementVersion()")
        );
        // (bool success, bytes memory data) = _addr.call(
        //     abi.encodeWithSignature("setLeagueSchedule()")
        // );
        // (bool success,  bytes memory data) = _addr.call(
        //     abi.encodeWithSignature("version()")
        // );
        // //console.log("Data");
        // (success,  data) = _addr.call(
        //     abi.encodeWithSignature("numWeeks()")
        // );
        // //console.log(data);
        // (success,  data) = _addr.call(
        //     abi.encodeWithSignature("leagueName()")
        // );
        //console.log(data);
        // (bool success, bytes memory data) = _addr.call(
        //     abi.encodeWithSignature("setLeagueSchedule()")
        // );
        //console.log("called test call");

        emit Response(success, data);
    }

    function addUsersToLeagueHelper(address[] memory addresses, address _addr) public {
        //This calls the game logic incrementVersion which is great
        //but how do we call it in js?
        // (bool success, bytes memory data) = _addr.call(
        //     abi.encodeWithSignature("incrementVersion()")
        // );
        bool success;
        bytes memory data;
        for(uint256 i = 0; i < addresses.length; i++) {
            (success, data) = _addr.call(
                abi.encodeWithSignature(
                    "addUserToLeague(address)",
                    addresses[i]
                )
            );
        }
        // (success,  data) = _addr.call(
        //     abi.encodeWithSignature("addUserToLeague()")
        // );
        // (success,  data) = _addr.call(
        //     abi.encodeWithSignature("addUserToLeague()")
        // );
        // (bool success, bytes memory data) = _addr.call(
        //     abi.encodeWithSignature("setLeagueSchedule()")
        // );
        //console.log("called test call");

        emit Response(success, data);
    }
}
