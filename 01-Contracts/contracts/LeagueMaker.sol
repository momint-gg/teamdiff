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
    // ======== Structs ========
    struct Parameters {
        string name;
        uint256 version;
    }

    // ======= Events ==========
    event LeagueCreated(string name, address a);

    // ======== Immutable storage ========
    // upgradeable beacon
    UpgradeableBeacon immutable upgradeableBeacon;
    //TODO I think I want to store the logic contract address here as well

    // ======== Mutable storage ========
    Parameters public parameters;
    address public beaconAddress;
    uint256 public version = 1;
    uint256 public secretNumber = 42;

    // ======== Constructor ========
    // the constructor deploys an initial version that will act as a template
    constructor(address _logic) {
        upgradeableBeacon = new UpgradeableBeacon(_logic);
    }

    //To use Clone library
    using Clones for address;

    function upgrade(address newLogicImpl) public {
        upgradeableBeacon.upgradeTo(newLogicImpl);
    }

    // ======== Deploy contract ========
    function createLeague(string calldata _name, uint256 _version)
        external
        returns (
            ///function createLeague(string _name, uint256 _version)
            ///payable
            address
        )
    {
        parameters = Parameters({name: _name, version: _version});
        //bytes memory delegateCallData = abi.encodeWithSignature("initialize(string calldata, uint256)", parameters.name, parameters.version);
        //bytes memory delegateCallData = abi.encodeWithSignature("initialize(string calldata)", "test name");
        //TODO memory clean-up should be done
        bytes memory delegateCallData = abi.encodeWithSignature(
            "initialize(uint256)",
            parameters.version
        );
        LeagueBeaconProxy proxy = new LeagueBeaconProxy(
            address(upgradeableBeacon),
            delegateCallData
        );

        emit LeagueCreated(parameters.name, address(proxy));
        delete parameters;
        //proxy.version();

        //console.log(address(proxy));
        return address(proxy);
    }

    event cloneCreated(address clone);

    // ============= Deploy Ligthweight clone ===========
    function createLeagueClone(address implementation) external {
        //Try returning just a clone with the implementation address
        //return implementation.cloneDeterministic(msg.sender);
        address cloneAddy = implementation.clone();
        console.log(cloneAddy);
        emit cloneCreated(cloneAddy);
        //return cloneAddy;
    }

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

    event Response(bool success, bytes data);

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
        //console.log("called test call");

        emit Response(success, data);
    }
}
