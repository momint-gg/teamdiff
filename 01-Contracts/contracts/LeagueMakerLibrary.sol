// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./Athletes.sol";
import "./LeagueOfLegendsLogic.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "./LeagueBeaconProxy.sol";
import "./LeagueMaker.sol";
import "./LeagueOfLegendsLogic.sol";

// Basically a helper contract for leaguemaker to reduce gas
contract LeagueMakerLibrary {
    // TODO: Add modifier so only LeagueMaker can call (onlyOwner w league maker as owner)

    //TODO set to only owner,
    //owner will be our Team Diff wallet
    //Set all schedules for all leagues
    function setLeagueSchedules(address[] memory leagueAddresses) public {
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("setLeagueSchedule()")
            );
            //emit Response(success, data);
            console.log("succes: ");
            console.log(success);
        }
    }

    //Locking lineups for all leagues
    //TODO set to only owner
    //Locks the league Members for all leagues, so nobody new can join or leave
    function lockLeagueMembership(address[] memory leagueAddresses) public {
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("setLeagueEntryIsClosed()")
            );
            //emit LeagueMaker.Response(success, data);
        }
    }

    //Locks all the leagues lineups, so you cannot change players after a certain point in the weeek
    //TODO set to only owner
    function lockLeagueLineups(address[] memory leagueAddresses) public {
        console.log("Locking league lineups in LeagueMakerLibrary");
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("lockLineup()")
            );
            //emit LeagueMaker.Response(success, data);
        }
    }

    //Unlocking lineups for all leagues
    //TODO set to only owner
    function unlockLeagueLineups(address[] memory leagueAddresses) public {
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("unlockLineup()")
            );
            //emit LeagueMaker.Response(success, data);
        }
    }

    //Evaluates weekly scores for all matchups in all leagues
    function evaluateWeekForAllLeagues(
        address[] memory leagueAddresses,
        uint256 currentWeek
    ) public {
        bool success;
        bytes memory data;
        for (uint256 i = 0; i < leagueAddresses.length; i++) {
            (success, data) = leagueAddresses[i].call(
                abi.encodeWithSignature("evaluateWeek(uint)", currentWeek)
            );
            //emit LeagueMaker.Response(success, data);
        }
    }

    // //TODO: Comment out for prod
    // //Test function
    // function test(address[] memory leagueAddresses) public {
    //     console.log("IN LEAGUE MAKER LIBRARY TEST FUNCTION");
    //     bool success;
    //     bytes memory data;
    //     for (uint256 i = 0; i < leagueAddresses.length; i++) {
    //         (success, data) = leagueAddresses[i].call(
    //             abi.encodeWithSignature("testLibrarySender()")
    //         );
    //         //emit LeagueMaker.Response(success, data);
    //     }
    // }
}
