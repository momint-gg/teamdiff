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
//contract LeagueProxy is ERC1967Proxy {
// contract LeagueProxy is BeaconProxy {  
// contract LeagueProxy is Proxy {
        // ======== Structs ========
    struct Parameters {
        string name;
        //string symbol;
    }


    // ======== Immutable storage ========
    // upgradeable beacon
    UpgradeableBeacon immutable upgradeableBeacon;
    //TODO I think I want to store the logic contract address here as well
   

    // ======== Mutable storage ========
    Parameters public parameters;
    address public beaconAddress;
    //State
    uint256 public version = 1;
    uint256 public secretNumber = 42;
    // ======== Constructor ========
    // the constructor deploys an initial version that will act as a template
    // ======== Constructor ========
    // the constructor deploys an initial version that will act as a template
    constructor(address _logic) {
        upgradeableBeacon =  new UpgradeableBeacon(_logic);
    }

    function upgrade(address newLogicImpl) public {
        upgradeableBeacon.upgradeTo(newLogicImpl);
    }


    // ======== Deploy contract ========
    function createLeague(string calldata _name)
        external
        returns (address)
    {
        parameters = Parameters({name: _name});
        BeaconProxy proxy = new BeaconProxy(
            address(upgradeableBeacon),
            "0x00"
        );
        delete parameters;
        return address(proxy);
    }

    // function setBeacon()
    //     external
    //     returns (address)
    // {
    //     //parameters = Parameters({name: _name});
    //     UpgradeableBeacon newBeacon = new UpgradeableBeacon(logic);
    //     //delete parameters;
    //     beaconAddress = address(newBeacon);
    //     return address(newBeacon);
    // }

    //Public getters for testing purposes
    // function getImplementation() public view returns (address) {
    //     return logic;
    // }

    function getBeacon() public view returns (address) {
        return address(upgradeableBeacon);
    }


    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
     * function call, and allows initializating the storage of the proxy like a Solidity constructor.
    // //  */
    // constructor(address _logic, bytes memory _data) payable {
    //     //Deploy a new GameLogic.sol contract
    //     //And then set this contracts _logic to be the address of the newly deployed logic
    //         //This need would be removed with beacon just FYI
    //     assert(_IMPLEMENTATION_SLOT == bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1));
    //     //_upgradeToAndCall(_logic, _data, false);
    //     //_upgradeToAndCall(IMPL_ADDRESS, _data, false);
    //     //_upgradeTo(IMPL_ADDRESS);
    //     _upgradeTo(_logic);
    // } 
        /**
     * @dev Initializes the proxy with `beacon`.
     *
     * If `data` is nonempty, it's used as data in a delegate call to the implementation returned by the beacon. This
     * will typically be an encoded function call, and allows initializating the storage of the proxy like a Solidity
     * constructor.
     *
     * Requirements:
     *
     * - `beacon` must be a contract with the interface {IBeacon}.
     */
    // constructor(address beacon, bytes memory data) payable {
    //     assert(_BEACON_SLOT == bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1));
    //     _upgradeBeaconToAndCall(beacon, data, false);
    // }

    // /**
    //  * @dev Returns the current implementation address.
    //  */
    // function _implementation() internal view virtual override returns (address impl) {
    //     return ERC1967Upgrade._getImplementation();
    //     //return "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
    // }

    // //Public getters for testing purposes
    // function getImplementation() public view returns (address) {
    //     return _getImplementation();
    // }

    // function getAdmin() public view returns (address) {
    //     return _getAdmin();
    // }

    
    // function setAdmin(address addy) public {
    //     console.log(msg.sender);
    //     _changeAdmin(addy);
    // }

    // /**
    //  * @dev Fallback function.
    //  * Implemented entirely in `_fallback`.
    //      //TODO, my fallback function is not working at all, it doesn't delegate calls or anything 
    //  */
    // fallback ()  override  payable external {
    //     //_fallback();
    //     //_delegate();
    //     console.log("fallback");
    // }

    // receive()  override payable external {
    //     //_fallback();
    //     //_delegate();
    //     console.log("fallback");
    // }
}


// OpenZeppelin Contracts v4.4.1 (proxy/ERC1967/ERC1967Proxy.sol)

// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/proxy/Proxy.sol";
// import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967UpgradeUpgradeable.sol";
// /**
//  * @dev This contract implements an upgradeable proxy. It is upgradeable because calls are delegated to an
//  * implementation address that can be changed. This address is stored in storage in the location specified by
//  * https://eips.ethereum.org/EIPS/eip-1967[EIP1967], so that it doesn't conflict with the storage layout of the
//  * implementation behind the proxy.
//  */
// contract LeagueProxy is Proxy, ERC1967Upgrade {
//     /**
//      * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
//      *
//      * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
//      * function call, and allows initializating the storage of the proxy like a Solidity constructor.
//      */
//     constructor(address _logic, bytes memory _data) payable {
//         assert(_IMPLEMENTATION_SLOT == bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1));
//         _upgradeTo(_logic);
//     }

//     /**
//      * @dev Returns the current implementation address.
//      */
//     function _implementation() internal view virtual override returns (address impl) {
//         return ERC1967Upgrade._getImplementation();
//     }
// }
