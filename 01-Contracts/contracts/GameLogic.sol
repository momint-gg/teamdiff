// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./Athletes.sol";
//import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

// contract GameLogic is OwnableUpgradeable/*, Initializable*/ {
contract GameLogic is Initializable {
    // Vars
    //TODO initialize all these in the initialize constructor
    uint256 version; // Length of a split
    uint256 numWeeks; // Length of a split
    uint256 leagueSize; // For testing
    uint256 currentWeekNum; // Keeping track of week number
    address[] leagueMembers;
    address[] whitelist;
    string leagueName;
    mapping(address => uint256) userToTotalPts;
    mapping(address => uint256[]) userToWeeklyPts;
    mapping(address => uint256[]) userLineup;

    // Our Athletes.sol contract
    Athletes athletesContract;

    struct Matchup {
        address[2] players;
    }
    mapping(uint256 => Matchup[8]) schedule; // Schedule for the league (generated before), maps week # => [matchups]


    // function initialize(string calldata _name, uint256 _version) public initializer {
    //Delegate call fails when string is passed
    function initialize(
        uint256 _version,
        uint256 _numWeeks,
        // uint256 _currentWeekNum
        address athletesDataStorage
        //uint256 _leagueSize
        ) public initializer {
        //Any local variables will be ignored, since this contract is only called in context of the proxy state, meaning we never change the state of this GameLogic contract
        version = _version;
        numWeeks = _numWeeks;
        currentWeekNum = uint256(0);
        leagueName = "League Name";
        athletesContract = Athletes(athletesDataStorage);
        leagueMembers.push(msg.sender);
        // console.log(string(abi.encodePacked("GameLogic initialized!: ", leagueMembers[0])));
        //console.log(leagueMembers[0]);
        console.log("Proxy initialized!");
    }

    function incrementVersion() external returns (uint256) {
        console.log("incrementing version:");
        version = version + 1;
        console.log(version);
    }

    function setLeagueSchedule() external 
    {
        console.log("setting schedule");
        //mapping(uint256 => uint256[2][]) storage schedule;
        //create two arrays of indices that represent indices in league.sol
        uint256[4] memory leftHalf;
        uint256[4] memory rightHalf;
        for(uint week = 0; week < 8; week++) {
            //address[8] = matchupSlots;
            console.log("\n"); 
            console.log(week);
            console.log("************************");

            uint256 matchupSlots;
            //Round league size to even number, for bytes
            (leagueMembers.length % 2 == 0) ? (
                matchupSlots = leagueMembers.length
            ) : (
                matchupSlots = (leagueMembers.length + 1)
            );

            //fill values of array
            uint256 rightArrTemp = rightHalf[0];
            // console.log("rightArrTemp");
            // console.log(rightArrTemp);
            //console.log(matchupSlots / 2);
            for(uint256 i = 0; i < matchupSlots / 2; i++) {
                //set indixes of leftHAlf and rightHAlf
                // console.log("i: ");
                // console.log(i);
                // console.log("leftHalf start ");

                // console.log(leftHalf[i]);
                // console.log("righthalf start");
                // console.log(rightHalf[i]);
                // console.log("\n");  
                if(week == 0) {
                    //init values in leftHalf and rightHalf
                    leftHalf[i] = i;
                    rightHalf[i] = i + matchupSlots / 2;
                }
                //otherwise rotate all indices clockwise
                else {
                    uint256 temp = leftHalf[i];
                    rightHalf[i] = temp;
                    leftHalf[i] = rightHalf[(i + 1) % ((matchupSlots / 2))];
                    

                }
                // if(i != matchupSlots / 2 - 1 || week == 0) {
                //     console.log("lefthalf end");
                //     console.log(leftHalf[i]);
                //     console.log("righthalf end");
                //     console.log(rightHalf[i]);
                //     console.log("\n");  

                // }
                //console.log(matchupSlots - i - week - 1);
            }
            if(week != 0) {
                leftHalf[(matchupSlots / 2) - 1] = rightArrTemp;
                // console.log("lefthalf last");
                // console.log(leftHalf[(matchupSlots / 2) - 1]);
                // console.log("righthalf last");
                // console.log(rightHalf[(matchupSlots / 2) - 1]);
                // console.log("\n"); 
            }
            //address[] memory matchupCandidates;
            for(uint256 i = 0; i < matchupSlots / 2; i++) {

                //if matchupslots greater than number of leagueMembers
                    //just match the last player with bye
                address[2] memory matchupArray;
                if(rightHalf[i] >= leagueMembers.length) {
                    matchupArray = [leagueMembers[leftHalf[i]], address(0)];
                }
                else if(leftHalf[i] >= leagueMembers.length) {
                    matchupArray = [address(0), leagueMembers[rightHalf[i]]];
                }
                else {
                    matchupArray = [leagueMembers[leftHalf[i]], leagueMembers[rightHalf[i]]];
                }
                // console.log(matchupArray[0]);
                // //console.log(leftHalf[i]);
                // console.log(" vs ");
                // console.log(matchupArray[1]);
                // //console.log(rightHalf[i]);
                // console.log("\n");  
                Matchup memory matchup = Matchup({
                    players: matchupArray
                });                  


                schedule[week][i / 2] = matchup;
                console.log(matchup.players[0]);
                console.log(" vs ");
                console.log(matchup.players[1]);
                console.log("\n");
            }

        }
    }

    // Setting the lineup for a user
    function setLineup(uint256[] memory athleteIds) public {
        userLineup[msg.sender] = athleteIds;
    }


    // Returning the lineup for a user
    function getLineup() public view returns (uint256[] memory) {
        return userLineup[msg.sender];
    }

    // Add user to league
    function addUserToLeague(address user) public {
        //for testing
        leagueMembers.push(user);
        //for prod
        // leagueMembers.push(msg.sender);
    }

    // Add user to whitelist
    function addUserToWhitelist() public {
        whitelist.push(msg.sender);
    }

    /**
     * @dev Fallback function.
     * Implemented entirely in `_fallback`.
    //  */
    // fallback() external payable {
    //     //_fallback();
    //     //_delegate();
    //     console.log("fallback in the logic");
    // }
}
