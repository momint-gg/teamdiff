// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LeagueBeaconProxy.sol";
import "./Athletes.sol";
import "./GameItems.sol";

contract LeagueMaker is Ownable {
    // ======= Events ==========
    event LeagueCreated(
        string name,
        address proxyAddress,
        address proxyAdminAddress,
        address[] initialWhitelistAddresses,
        address stakeTokenAddress
    );
    event Response(bool success, bytes data);

    // ======== Immutable storage ========
    UpgradeableBeacon immutable upgradeableBeacon;
    address immutable teamDiffAddress;

    // For staking
    IERC20 erc20;

    // ======== Mutable storage ========
    address beaconAddress;
    address[] public leagueAddresses; //list of all deployed leagueAddresses
    mapping(address => address[]) public userToLeagueMap; //Maps Users to all the leagues they are a member of or on the whitelist for
    mapping(address => bool) public isProxyMap;
    uint256 numWeeks;

    uint256 _numWeeks = 8;
    uint256 public currentWeek = 0;
    address _polygonUSDCAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // When we deploy to mainnet
    address _rinkebyUSDCAddress = 0xeb8f08a975Ab53E34D8a0330E0D34de942C95926;

    // ======== Constructor ========
    constructor(address _logic) {
        upgradeableBeacon = new UpgradeableBeacon(_logic);
        teamDiffAddress = msg.sender;
    }

    // ======== Deploy New League Proxy ========
    function createLeague(
        string calldata _name,
        uint256 _stakeAmount,
        bool _isPublic,
        address _admin,
        address _erc20Address,
        address _athletesContractAddress,
        address _gameItemsContractAddress,
        address[] calldata _whitelistUsers
    ) external returns (address) {
        require(_stakeAmount <= 100, "League stake amount must be below 100");

        erc20 = IERC20(_erc20Address);
        require(
            erc20.balanceOf(address(msg.sender)) >= _stakeAmount,
            "Creator of league needs enough USDC (equal to specified stake amount)."
        );

        bytes memory delegateCallData = abi.encodeWithSignature(
            "initialize(string,uint256,bool,address,address,address,address,address,address)",
            _name,
            _stakeAmount,
            _isPublic,
            _athletesContractAddress,
            _admin,
            _erc20Address,
            _gameItemsContractAddress,
            teamDiffAddress,
            address(this)
        );

        LeagueBeaconProxy proxy = new LeagueBeaconProxy(
            address(upgradeableBeacon),
            delegateCallData
        );

        leagueAddresses.push(address(proxy));

        userToLeagueMap[msg.sender].push(address(proxy));
        isProxyMap[address(proxy)] = true;

        emit LeagueCreated(_name, address(proxy), _admin, _whitelistUsers, _erc20Address);
        return address(proxy);
    }

    function getLeagueAddresses() public view returns (address[] memory) {
        return leagueAddresses;
    }

    function updateUserToLeagueMapping(address user) external {
        require(isProxyMap[msg.sender], "Caller is not a valid proxy address.");
        userToLeagueMap[user].push(msg.sender);
    }

    function setBeacon(address logic) external returns (address) {
        UpgradeableBeacon newBeacon = new UpgradeableBeacon(logic);
        beaconAddress = address(newBeacon);
        return address(newBeacon);
    }

    // Only our wallet can call, need this because the "owner" of the proxy contract isn't us
    modifier onlyTeamDiff() {
        require(msg.sender == teamDiffAddress, "Caller is not TeamDiff");
        _;
    }

    // Season starting late
    function incrementCurrentWeek() external onlyTeamDiff {
        currentWeek++;
    }
    
    // Season starting late 
    function decrementCurrentWeek() external onlyTeamDiff {
        currentWeek--;
    }

}
