//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./Structs.sol";

//To do:
//Make function for minting packs -- basically going to just transfer NFTs. Use chainlink VRF for randomization.

// import "./ERC155Mintable.sol";
// We can read in the total list of players from API or whatever
// How to do after the contract is deployed?

contract GameItems is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) private _uris;
    string private playerApiUrl =
        "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/";

    uint256 private numAthletes = 3;
    uint256 private NFTPerAthlete = 10;

    constructor()
        public
        ERC1155(
            "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player{id}.json"
        )
    {
        console.log("Making contract, minting initial currency supply...");
        //Minting our initial currency
        // mintCurrency(10000000);

        //Minting our athletes
        mintAthletes();
    }

    //Minting NFTs to this contract
    function mintAthletes() public onlyOwner {
        for (uint256 i = 1; i < numAthletes + 1; i++) {
            uint256 newPlayerId = _tokenIds.current();
            _mint(address(this), newPlayerId, NFTPerAthlete, "");
            setTokenUri(
                newPlayerId,
                string(
                    abi.encodePacked(
                        playerApiUrl,
                        "player",
                        Strings.toString(_tokenIds.current() + 1),
                        ".json"
                    )
                )
            );
            _tokenIds.increment();
        }
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
