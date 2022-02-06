//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
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
    using SafeMath for uint256;

    // Following the OpenSea metadata standards: https://docs.opensea.io/docs/metadata-standards, Check the "fake API" folder for details
        // Note: I think the Image needs to be in its own IPFS (can't just link in IPFS)
    string private playerApiUrl = //athlete
        "https://ipfs.io/ipfs/QmVwNeMaU8AdB7E3UKwKD9FYpXD4vLimv2kQ1fFBMKDFNt/";

    // Later pass these constants into the constructor! (don't want constants in our code)
    // For my strategy to work (adapted BAYC but for 1155) the following must be true:
        // Max num athletes (i.e. 50) * NFTs per athlete (i.e. 30) = Max packs (i.e. 500) * 3
        // This is for random indexing
    uint256 private NUM_ATHLETES = 3; // Max size of the collection
    uint256 private NFT_PER_ATHLETE = 10; // how much of each athlete
    uint256 private constant PACK_SIZE = 3;

    bool public packsReadyToOpen = false;

    uint256 public REVEAL_TIMESTAMP; //can set this later 

    // For the pack NFT
    string private packURI =
        "https://ipfs.io/ipfs/QmW4HEz39zdzFDigDa18SzwSzUejCf2i4dN3Letfzar6gH?filename=pack.json";
    uint256 private constant maxPacks = 10; //Some set number of packs we decide
    uint256 private packsMinted = 0; 

    // Provenance
    uint256 public startingIndexBlock;
    uint256 public startingIndex;
    string provenance = "";

    // Mappings
    mapping(uint256 => string) private _uris;
    // mapping(uint256 => address) private ownerOfNFT;
    mapping()

    // Events
    event packMinted(address user, uint256 id);

    constructor() ERC1155("") {
        console.log("Making contract...");
        REVEAL_TIMESTAMP = 0; // For testing
    }

    // Athletes can only be minted once our "switch" has been flipped
    function packsReadyToOpen() public onlyOwner {
        packsReadyToOpen = !packsReadyToOpen;
    }

    // //Earlier mint athlete function -- will change
    // function mintAthletes() public onlyOwner {
    //     for (uint256 i = 0; i < MAX_ATHLETES; i++) {
    //         uint256 newAthleteId = _tokenIds.current();
    //         _mint(address(this), newAthleteId, NFTPerAthlete, "");
    //         ownerOfNFT[newAthleteId] = address(this);
    //         setTokenUri(
    //             newAthleteId,
    //             string(
    //                 abi.encodePacked(
    //                     playerApiUrl,
    //                     "athlete",
    //                     Strings.toString(_tokenIds.current() + 1),
    //                     ".json"
    //                 )
    //             )
    //         );
    //         _tokenIds.increment();
    //     }
    // }

    // Mints an athlete -- called when someone "burns" a pack
    function mintAthleteNew() public payable {
        // Index of what to mint -- we need to % by num athletes since 
        uint mintIndex = totalSupply() % NUM_ATHLETES;
        if (totalSupply() < NUM_ATHLETES * NFT_PER_ATHLETE) {
            _mint(msg.sender, mintIndex);
        }

        // If we haven't set the starting index and this is either 1) the last saleable token or 2) the first token to be sold after
        // the end of pre-sale, set the starting index block
        if (startingIndexBlock == 0 && (totalSupply() == NUM_ATHLETES * NFT_PER_ATHLETE || block.timestamp >= REVEAL_TIMESTAMP)) {
            startingIndexBlock = block.number;
        } 
    }

    // Minting a pack to the current user -- later going to be burned and given 3 random NFTs
    function mintPack() public onlyOwner {
        require(packsMinted < maxPacks, "All packs have alreayd been minted!");

        uint256 newPackId = _tokenIds.current();
        _mint(address(msg.sender), newPackId, 1, "");
        ownerOfNFT[newPackId] = address(msg.sender);
        
        setTokenUri(newPackId, string(abi.encodePacked(packURI)));

        packsMinted += 1;
        emit packMinted(msg.sender, _tokenIds.current());
        _tokenIds.increment();
    }

    // // Burning a pack and giving 3 random athlete NFTs to sender
    // function burnPack(uint256 packId) public {
    //     require(balanceOf(msg.sender, packId) > 0); //make sure pack hasn't been burned yet

    //     // Burning the pack and assigning user 3 NFTs.
    //     // Still need to do this once I get provenance done.
    // }

    // Setting starting Index for the collection
    function setStartingIndex() public {
        require(startingIndex == 0, "Starting index is already set");
        require(startingIndexBlock != 0, "Starting index block must be set");
        
        // Setting the starting index
        startingIndex = uint(blockhash(startingIndexBlock)) % (NUM_ATHLETES * NFT_PER_ATHLETE * PACK_SIZE);

        // Just a sanity case in the worst case if this function is called late (EVM only stores last 256 block hashes)
        // if (block.number.sub(startingIndexBlock) > 255) {
        if (block.number - startingIndexBlock) > 255) {
            startingIndex = uint(blockhash(block.number - 1)) % (NUM_ATHLETES * NFT_PER_ATHLETE * PACK_SIZE);
        }
        // Prevent default sequence
        if (startingIndex == 0) {
            startingIndex = startingIndex.add(1);
        }
    }

    // Setting starting index block
     function emergencySetStartingIndexBlock() public onlyOwner {
        require(startingIndex == 0, "Starting index is already set");
        
        startingIndexBlock = block.number;
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
        return NFT_PER_ATHLETE;
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
