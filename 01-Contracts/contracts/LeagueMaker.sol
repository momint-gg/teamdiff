// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LeagueBeaconProxy.sol";
import "./Athletes.sol";
import "./GameItems.sol";
import "./TestUSDC.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./LeagueMakerLibrary.sol";

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
    address immutable teamDiffAddress;
    // TODO: Make the Athletes and GameItems contracts immutable in LOL Logic, can't get working right now
    // Issue is that proxy vars are initializes with initialize() function and not a constructor, and you cannot initialize immutable vars unless it's in a constructor. So we're stuck
    // Unless we just deploy them first, manually put those addresses ^ into our LOL Logic constructor, etc. but that might be bad practice
    // Might want to discuss the above ^ as a team
    // Athletes immutable athletesContract;
    // GameItems immutable gameItemsContract;

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

    // ======== Constructor ========
    constructor(address _logic) {
        upgradeableBeacon = new UpgradeableBeacon(_logic);
        // Creating the teamDiffAddress (we can hardcode this later if we want to change it)
        teamDiffAddress = msg.sender;
    }

    // ======== Deploy New League Proxy ========
    // First need to prompt approval before calling this function for the stakeAmount to be spend by league creator
    function createLeague(
        string calldata _name,
        uint256 _stakeAmount,
        bool _isPublic,
        address _testUSDCAddress, // Note: We will take this out once we deploy to mainnet (b/c will be using public ABI), but we need for now
        address _athletesContractAddress,
        address _gameItemsContractAddress
    ) external returns (address) {
        bytes memory delegateCallData = abi.encodeWithSignature(
            "initialize(string,uint256,bool,address,address,address,address,address,address,address)",
            _name,
            _stakeAmount,
            _isPublic,
            _athletesContractAddress,
            msg.sender, // I was wrong before.. msg.sender IS the admin
            _rinkebyUSDCAddress,
            _testUSDCAddress,
            _gameItemsContractAddress,
            teamDiffAddress,
            address(this)
        );

        testUSDC = TestUSDC(_testUSDCAddress);

        // Make sure the creator of the league has enough USDC
        require(
            testUSDC.balanceOf(address(msg.sender)) >= _stakeAmount,
            "Creator of league needs enough USDC (equal to specified stake amount)."
        );

        LeagueBeaconProxy proxy = new LeagueBeaconProxy(
            address(upgradeableBeacon),
            delegateCallData
        );

        // Creator of the league staking their initial currency when they call createLeague()
        // TODO: Test different address that isn't also TeamDiff owner making a league and make sure the owner initial staking works
        testUSDC.transferFrom(msg.sender, address(proxy), _stakeAmount);

        leagueAddresses.push(address(proxy));
        userToLeagueMap[msg.sender].push(address(proxy));
        isProxyMap[address(proxy)] = true;

        emit LeagueCreated(_name, address(proxy), msg.sender);

        return address(proxy);
    }

    // You need a getter for this because Solidity's default getter (AKA contract.leagueAddresses()) needs to be called with an index
    // ^ And we want the whole list
    function getLeagueAddresses() public view returns (address[] memory) {
        return leagueAddresses;
    }

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
