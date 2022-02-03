//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

import "./RandomNumber.sol";

//To do:
//Make function for minting packs -- basically going to just transfer NFTs. Use chainlink VRF for randomization.

// import "./ERC155Mintable.sol";
// We can read in the total list of players from API or whatever
// How to do after the contract is deployed?

contract GameItems is ERC1155, Ownable, RandomNumber {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) private _uris;
    string private playerApiUrl =
        "https://ipfs.io/ipfs/QmVwNeMaU8AdB7E3UKwKD9FYpXD4vLimv2kQ1fFBMKDFNt/";

    //We will later pass these 2 variables into constructor when calling
    uint256 internal numAthletes = 3;
    uint256 internal startingNum = 0; //First collection, so 0 in this case
    uint256 internal NFTPerAthlete = 10;

    constructor() public ERC1155("") RandomNumber() {
        console.log("Making contract, minting initial currency supply...");

        //Minting our athletes -- check "fakeApi" folder for athlete format
        mintAthletes();
    }

    //Minting NFTs to this contract
    //Following the OpenSea metadata standards: https://docs.opensea.io/docs/metadata-standards
    //Check the "fake API" folder for details
    function mintAthletes() public onlyOwner {
        for (uint256 i = 1; i < numAthletes + 1; i++) {
            uint256 newPlayerId = _tokenIds.current();
            _mint(address(this), newPlayerId, NFTPerAthlete, "");
            setTokenUri(
                newPlayerId,
                string(
                    abi.encodePacked(
                        playerApiUrl,
                        "athlete",
                        Strings.toString(_tokenIds.current() + 1),
                        ".json"
                    )
                )
            );
            _tokenIds.increment();
        }
    }

    //Choosing 3 random IDs in range of starting num to num of athletes then transfer those
    //As long as we have the number of athletes passed in, and starting number, we should be fine
    function mintPack() public {
        uint256 randy = RandomNumber.randomResult;
        uint256 randy2 = RandomNumber.randomResult;
        uint256 randy3 = RandomNumber.randomResult;

        //Require balance of NFTs to be high enough
        // require(balanceOf(address(this), randy) > 0 &&)

        //Transfer the NFTs to function caller
        safeTransferFrom(address(this), msg.sender, randy, 1, "0x00");
        safeTransferFrom(address(this), msg.sender, randy2, 1, "0x00");
        safeTransferFrom(address(this), msg.sender, randy3, 1, "0x00");
    }

    //Dynamically setting new URI for a minted token
    function setTokenUri(uint256 tokenId, string memory uri) public onlyOwner {
        _uris[tokenId] = uri;
    }

    //Just getting the URI for a token
    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    //Minting our "SLP", in game currency
    function mintCurrency(uint256 initialSupply) public {
        uint256 id = _tokenIds.current(); //should be 0
        _mint(msg.sender, id, initialSupply, "");
        _tokenIds.increment();
    }

    //Transfer in game currency
    //Then use safeTransferFrom with ID of NFT to transfer NFTs
    function transferCurrency(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) public {
        safeTransferFrom(from, to, 0, amount, data);
    }
}
