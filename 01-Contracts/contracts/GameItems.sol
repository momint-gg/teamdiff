//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./Structs.sol";

// import "./ERC155Mintable.sol";

contract GameItems is ERC1155, Ownable {
    //Counter for NFT IDs
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    //Mapping token ID --> URI
    mapping(uint256 => string) private _uris;
    //Our API url for athlete data -- just a sample IPFS url for now with fake API data
    string playerApiUrl =
        "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/";

    //We'd replace the constructor arg with our API url later (just made sample IPFS for now)
    constructor() public ERC1155("") {
        console.log("Making contract!");
    }

    //Minting a new athelete, specify amount of them you want to mint
    //Also need to figure out how to set URI
    function mintAthlete(uint256 amount) public onlyOwner {
        uint256 newPlayerId = _tokenIds.current();
        _mint(msg.sender, newPlayerId, amount, "");
        setTokenUri(
            newPlayerId,
            (
                string(
                    abi.encodePacked(
                        "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/",
                        newPlayerId + 1,
                        ".json"
                    )
                )
            )
        );
        _tokenIds.increment();
    }

    //Dynamically setting new URI for a minted token
    function setTokenUri(uint256 tokenId, string memory uri) public onlyOwner {
        _uris[tokenId] = uri;
    }

    //Just getting the URI for a token
    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    // //Transfers 3/x NFTs from the contract to the User (if there are enough)
    // function openPack() {

    // }

    //Minting our "SLP", in game currency
    function mintCurrency(uint256 initialSupply) public {
        uint256 id = _tokenIds.current();
        _mint(msg.sender, id, initialSupply, "");
        _tokenIds.increment();
    }
}
