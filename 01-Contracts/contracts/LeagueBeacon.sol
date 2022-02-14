// // //SPDX-License-Identifier: Unlicense
// pragma solidity ^0.8.0;
// import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

// contract LeagueBeacon is UpgradeableBeacon, Ownable {
//     // ======== Structs ========
//     struct Parameters {
//         string name;
//         string symbol;
//     }

//     // ======== Immutable storage ========
//     // upgradeable beacon
//     //UpgradeableBeacon immutable upgradeableBeacon;

//     // ======== Mutable storage ========
//     //Parameters public parameters;

//     // ======== Constructor ========
//     // the constructor deploys an initial version that will act as a template
//     constructor(address _logic) {
//         upgradeableBeacon =  UpgradeableBeacon(_logic);
//     }

//     function upgrade(address newLogicImpl) onlyOwner public {
//         upgradeableBeacon.upgradeTo(newLogicImpl);
//     }
// }