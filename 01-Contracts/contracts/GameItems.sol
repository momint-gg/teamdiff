//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

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
    string private athleteURI = //athlete
        "https://ipfs.io/ipfs/QmZTS9tkkueLvRKdteRzXYHrh84YAB2TFC3ApQSDtGy1PB/";

    // Later pass these constants into the constructor! (don't want constants in our code)
    // For my strategy to work (adapted BAYC but for 1155) the following must be true:
        // Max num athletes (i.e. 50) * NFTs per athlete (i.e. 30) = Max packs (i.e. 500) * 3
        // This is for random indexing
    uint256 private constant NUM_ATHLETES = 3; // Max size of the collection
    uint256 private constant NFT_PER_ATHLETE = 10; // how much of each athlete
    uint256 private constant PACK_SIZE = 3;

    // For the pack NFT
    string private packURI =
        "https://ipfs.io/ipfs/QmW4HEz39zdzFDigDa18SzwSzUejCf2i4dN3Letfzar6gH?filename=pack.json";
    uint256 private constant maxPacks = 10; //Some set number of packs we decide
    uint256 private packsMinted = 0; 

    //When we flip the switch and let everyone open packs
    bool public packsReadyToOpen = false;

    uint256 public REVEAL_TIMESTAMP = 10000; //can set this later 

    //should athlete pack IDs after athletes to avoid confusion
    //For example: 1-1500 IDs are athletes, 1500-2000 are packs
        //Maybe not the best way? There's a function total Supply we may want to use, but it could complicate things if we are opening packs and also minting them
    uint256 private currentPackId = NUM_ATHLETES * NFT_PER_ATHLETE; 

    //The total amount of athletes so far we've minted
    //different from NUM_ATHLETES bc this will change
    uint256 private numAthletes = 0; 

    // Provenance
    uint256 public startingIndexBlock;
    uint256 public startingIndex;
    string provenance = "";

    // Mappings
    mapping(uint256 => string) private _uris;
    // mapping(uint256 => address) private ownerOfNFT;

    // Events
    event packMinted(address user, uint256 id);


    constructor() ERC1155("") {
        console.log("Making contract...");
        // REVEAL_TIMESTAMP = 0; // For testing
    }

    // Athletes can only be minted once our "switch" has been flipped
    function setPacksReady() public onlyOwner {
        packsReadyToOpen = !packsReadyToOpen;
    }

    // Mints an athlete -- called when someone "burns" a pack
    function mintAthlete() public onlyOwner {
        // Index of what to mint -- we need to % by num of NFTs per athlete 
        uint256 mintIndex = (startingIndex + numAthletes) % NUM_ATHLETES; 
        console.log("Starting index", startingIndex);
        console.log("Mint index", mintIndex);

        if (numAthletes < NUM_ATHLETES * NFT_PER_ATHLETE) {
            // require(totalSupply(mintIndex) < NUM_ATHLETES * NFT_PER_ATHLETE, "Purchase would exceed max supply of this token.");
            _mint(address(msg.sender), numAthletes, 1, "0x00");

            // Setting the URI for the athlete 
            setTokenUri(
                numAthletes,
                string(
                    abi.encodePacked(
                        athleteURI,
                        "athlete",
                        Strings.toString(mintIndex + 1), // B/c it starts at athlete 1 on IPFS for now
                        ".json"
                    )
                )
            );
            numAthletes += 1; // BAYC had a func for total supply. Just incrementing a state variable here
        }
    }

    // Minting a pack to the current user -- later going to be burned and given 3 random NFTs
    function mintPack() public onlyOwner {
        require(packsMinted < maxPacks, "All packs have already been minted!");

        _mint(address(msg.sender), currentPackId, 1, "");
        // ownerOfNFT[newPackId] = address(msg.sender);
        
        setTokenUri(currentPackId, string(abi.encodePacked(packURI)));

        currentPackId += 1;
        emit packMinted(msg.sender, currentPackId); 
        _tokenIds.increment();
    }

    // Burning a pack and giving 3 random athlete NFTs to sender
    function burnPack(uint packId) public {
        // require(balanceOf(address(msg.sender), packId) > 0, "Pack has already been burned or does not exist."); //make sure pack hasn't been burned yet
        // Assigning the user 3 NFTs
        for (uint i = 0; i < PACK_SIZE; i++) {
            mintAthlete();
        }
        // Burning the pack
        _burn(address(msg.sender), packId, 1);
    }

    // Setting starting Index for the collection
    function setStartingIndex() public onlyOwner {        
        // Setting the starting index
        startingIndex = uint(blockhash(block.number - 1)) % (NUM_ATHLETES * NFT_PER_ATHLETE);
        console.log("Starting index ", startingIndex);

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
    // Set with: (tokenId + startingIndex) % # of tokens
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
