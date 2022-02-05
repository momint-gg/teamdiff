//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

//To do:
//Make function for minting packs -- basically going to just transfer NFTs. Use chainlink VRF for randomization.

// We can read in the total list of players from API or whatever
// How to do after the contract is deployed?

contract GameItems is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Going to be our provenance hash for the collection
    // BAYC provenance: https://gist.github.com/JofArnold/bf2c4a094fcdd4aee2f52983c7714de8
    string provenance = "";

    // Following the OpenSea metadata standards: https://docs.opensea.io/docs/metadata-standards
    // Check the "fake API" folder for details
        // Note: I think the Image needs to be in its own IPFS (can't just link in IPFS)
    string private playerApiUrl = //athlete
        "https://ipfs.io/ipfs/QmVwNeMaU8AdB7E3UKwKD9FYpXD4vLimv2kQ1fFBMKDFNt/";
    uint256 private numAthletes = 3;
    uint256 private startingNum = 0; //First collection, so 0 in this case
    uint256 private NFTPerAthlete = 10;
    uint256 private constant PACK_SIZE = 3;

    // For the pack NFT
    string private packURI =
        "https://ipfs.io/ipfs/QmW4HEz39zdzFDigDa18SzwSzUejCf2i4dN3Letfzar6gH?filename=pack.json";
    uint256 private constant maxPacks = 10; //Some set number of packs we decide
    uint256 private packsMinted = 0; 

    // Mappings
    mapping(uint256 => string) private _uris;
    mapping(uint256 => address) private ownerOfNFT;

    // Events
    event packMinted(address user, uint256 id);

    constructor() ERC1155("") {
        console.log("Making contract...");
        //Minting our athletes
        mintAthletes();
    }

    function mintAthletes() public onlyOwner {
        for (uint256 i = 0; i < numAthletes; i++) {
            uint256 newAthleteId = _tokenIds.current();
            _mint(address(this), newAthleteId, NFTPerAthlete, "");
            ownerOfNFT[newAthleteId] = address(this);
            setTokenUri(
                newAthleteId,
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

    // Minting a pack to the current user -- later going to be burned and given 3 random NFTs
    function mintPack() public onlyOwner {
        require(packsMinted < maxPacks);

        uint256 newPackId = _tokenIds.current();
        _mint(address(msg.sender), newPackId, 1, "");
        ownerOfNFT[newPackId] = address(msg.sender);
        
        setTokenUri(newPackId, string(abi.encodePacked(packURI)));

        packsMinted += 1;
        emit packMinted(msg.sender, _tokenIds.current());
        _tokenIds.increment();
    }

    // Burning a pack and giving 3 random athlete NFTs to sender
    function burnPack(uint256 packId) public {
        require(balanceOf(msg.sender, packId) > 0); //make sure pack hasn't been burned yet

        // Burning the pack and assigning user 3 NFTs.
    }

    // Setting provenance once it is calculated
    // How to calculate initial provenance hash? https://medium.com/coinmonks/the-elegance-of-the-nft-provenance-hash-solution-823b39f99473
    function setProvenanceHash(string memory provenanceHash) public onlyOwner {
        provenance = provenanceHash;
    }

    // Dynamically setting new URI for a minted token
    function setTokenUri(uint256 tokenId, string memory uri) public onlyOwner {
        _uris[tokenId] = uri;
    }

    // Just getting the URI for a token
    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    // function getNumAthletes() public onlyOwner returns(uint memory) {
    //     return this.numAthletes;
    // }

    function getNFTPerAthlete() public view onlyOwner returns (uint256) {
        return NFTPerAthlete;
        //return uint(10);
    }

    // Minting our "SLP", in game currency
    function mintCurrency(uint256 initialSupply) public {
        uint256 id = _tokenIds.current(); //should be 0
        _mint(msg.sender, id, initialSupply, "");
        _tokenIds.increment();
    }

    // Transfer in game currency
    // Then use safeTransferFrom with ID of NFT to transfer NFTs
    function transferCurrency(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) public {
        safeTransferFrom(from, to, 0, amount, data);
    }
}
