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
import "./GameItems.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev This contract implements a proxy that gets the implementation address for each call from a {UpgradeableBeacon}.
 *
 * The beacon address is stored in storage slot `uint256(keccak256('eip1967.proxy.beacon')) - 1`, so that it doesn't
 * conflict with the storage layout of the implementation behind the proxy.
 *
 * _Available since v3.4._
 */
contract LeagueBeaconProxy is
    Proxy,
    ERC1967Upgrade,
    Ownable,
    AccessControl
{
    string public leagueName;
    uint256 public numWeeks; // Current week of the split
    uint256 public stakeAmount;
    uint256 public currentWeekNum;
    address public admin;
    address public teamDiffAddress;
    bool public leagueEntryIsClosed;
    bool public lineupIsLocked;
    bool public isPublic;

    mapping(address => uint256[8]) public userToRecord; // User to their record
    mapping(address => uint256[5]) public userToLineup; // User to their lineup
    mapping(address => uint256[8]) public userToWeekScore; // User to their team's score each week
    mapping(address => uint256) public userToPoints; // User to their total points (win = 2 pts, tie = 1 pt)
    mapping(address => bool) public inLeague; // Checking if a user is in the league
    address[] public leagueMembers; // Contains league members (don't check this in requires though, very slow/gas intensive)
    address[] private leagueWinners;

    // League schedule
    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[]) schedule; // Schedule for the league (generated before), maps week # => [matchups]

    /**********************/
    /* IMMUTABLE STORAGE  */
    /**********************/
    struct Stats {
        uint256 kills;
        uint256 deaths;
        uint256 assists;
        uint256 minionScore;
    }

    Athletes athletesContract;
    Whitelist public whitelistContract;
    LeagueMaker leagueMakerContract;
    IERC20 public erc20;
    GameItems gameItemsContract;

    //**************/
    //*** Events ***/
    /***************/
    event Staked(address sender, uint256 amount, address leagueAddress);
    event athleteSetInLineup(address sender, uint256 index, uint256 position);
    event testUSDCDeployed(address sender, address contractAddress);
    event leagueEnded(address[] winner, uint256 prizePotPerWinner);

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
