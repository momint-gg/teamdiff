// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (proxy/beacon/BeaconProxy.sol)

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Athletes.sol";
import "./Whitelist.sol";
import "./LeagueMaker.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
/**
 * @dev This contract implements a proxy that gets the implementation address for each call from a {UpgradeableBeacon}.
 *
 * The beacon address is stored in storage slot `uint256(keccak256('eip1967.proxy.beacon')) - 1`, so that it doesn't
 * conflict with the storage layout of the implementation behind the proxy.
 *
 * _Available since v3.4._
 */
contract LeagueBeaconProxy is Proxy, ERC1967Upgrade, Ownable, AccessControl, Whitelist {
 uint256 public version; // tsting
    string public leagueName;
    //uint256 public numWeeks; // Length of a split
    //uint256 public currentWeekNum; // Keeping track of week number
    address[] public leagueMembers;
    //address[] whitelist;
    //Note Admin will be the user, and our leaguemaker will be the owner, must grant access control
    //address owner;
    // address admin;
    //Maps each league member to the running count of their total wins
    //TODO, do we need this data structure?
    //mapping(address => uint256) userToTotalWins;
    //Maps each league member to an array that represents a win or loss for each week
    mapping(address => uint256[8]) userToRecord;
    //TODO how should we lock this lineUp?
    bool leagueEntryIsClosed;
    bool lineupIsLocked;
    //bool isPublic;
    //TODO can we set this to a fixed size line up array of size 5?
    mapping(address => uint256[]) userLineup;
    //uint256 private totalSupply;// Total supply of USDC
    uint256 public stakeAmount; // Amount that will be staked (in USDC) for each league
    
    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]
    

    

    /**********************/
    /* IMMUTABLE STORAGE  */
    /**********************/
    // struct Stats {
    //     uint256 kills;
    // }

    // address public polygonUSDCAddress; // When we deploy to mainnet
    // address public rinkebyUSDCAddress;
    // // Our Athletes.sol contract
    // Athletes athletesContract;
    // // Our Whitelist contract
    // Whitelist whitelistContract;
    // // Our LeagueMaker contract
    // LeagueMaker leagueMakerContract;

    // Vars
    //Hmmm when I uncomment the below, some of the storage slots are correctly initialized
        //but I can't figure out why, so I'll just use getters in the gamelogic contract for now
    // uint256 public version; // tsting
    // string public leagueName;
    // uint256 public numWeeks; // Length of a split
    // uint256 public currentWeekNum; // Keeping track of week number
    // address[] public leagueMembers;
    // //address[] whitelist;
    // //Note Admin will be the user, and our leaguemaker will be the owner, must grant access control
    // //address owner;
    // // address admin;
    // mapping(address => uint256) userToTotalPts;
    // mapping(address => uint256[]) userToWeeklyPts;
    // mapping(address => uint256[]) userLineup;
    // uint256 private totalSupply;// Total supply of USDC
    // uint256 public stakeAmount; // Amount that will be staked (in USDC) for each league
    // address public polygonUSDCAddress; // When we deploy to mainnet
    // address public rinkebyUSDCAddress;

    // // Our Athletes.sol contract
    // Athletes athletesContract;
    // // Our Whitelist contract
    // Whitelist whitelistContract;
    // // Our LeagueMaker contract
    // LeagueMaker leagueMakerContract;

    // struct Matchup {
    //     address[2] players;
    // }
    // mapping(uint256 => Matchup[8]) schedule; // Schedule for the league (generated before), maps week # => [matchups]

    //Events
    //event Staked(address sender, uint256 amount);
    
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
    constructor(address beacon, bytes memory data) payable {
        assert(
            _BEACON_SLOT ==
                bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1)
        );
        _upgradeBeaconToAndCall(beacon, data, false);
    }

    /**
     * @dev Returns the current beacon address.
     */
    function _beacon() internal view virtual returns (address) {
        return _getBeacon();
    }

    /**
     * @dev Returns the current implementation address of the associated beacon.
     */
    function _implementation()
        internal
        view
        virtual
        override
        returns (address)
    {
        return IBeacon(_getBeacon()).implementation();
    }

    /**
     * @dev Changes the proxy to use a new beacon. Deprecated: see {_upgradeBeaconToAndCall}.
     *
     * If `data` is nonempty, it's used as data in a delegate call to the implementation returned by the beacon.
     *
     * Requirements:
     *
     * - `beacon` must be a contract.
     * - The implementation returned by `beacon` must be a contract.
     */
    function _setBeacon(address beacon, bytes memory data) internal virtual {
        _upgradeBeaconToAndCall(beacon, data, false);
    }
}
