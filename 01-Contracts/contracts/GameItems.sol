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

contract GameItems is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    using SafeMath for uint256;

    // Later pass these constants into the constructor
    uint256 private constant NUM_ATHLETES = 4; // Max size of the collection
    uint256 private constant NFT_PER_ATHLETE = 10; // how much of each athlete
    uint256 private constant STARTER_PACK_SIZE = 5;
    uint256 private constant BOOSTER_PACK_SIZE = 3;
    uint256 private constant MAX_STARTER_PACK_BALANCE = 1;
    uint256 private constant MAX_BOOSTER_PACK_BALANCE = 1;
    uint256 private constant MAX_PACKS = 10; //Some set number of packs we decide

    // URIs
    // Following the OpenSea metadata standards: https://docs.opensea.io/docs/metadata-standards, Check the "fake API" folder for details
    // Note: I think the Image needs to be in its own IPFS (can't just link in IPFS)
    string private athleteURI =
        "https://gateway.pinata.cloud/ipfs/QmV6Bt7xVz468sD7pgAYXHJqSDpPuymMVnpb2Tuk58zXVU/";
    string private starterPackURI =
        "https://ipfs.io/ipfs/QmW4HEz39zdzFDigDa18SzwSzUejCf2i4dN3Letfzar6gH?filename=pack.json";
    string private boosterPackURI = "Insert booster pack URI here :)";

    // When we flip the switch and let everyone open packs
    // (Setting to true for now for easy testing)
    bool public packsReadyToOpen = true;

    uint256 public REVEAL_TIMESTAMP = 10000; //can set this later, if we have presale stuff

    //Should mint pack IDs after athletes to avoid confusion
    uint256 private starterPackId = NUM_ATHLETES;
    uint256 private boosterPackId = starterPackId;
    //Total amount of packs minted so far
    uint256 private starterPacksMinted = 0;
    uint256 private boosterPacksMinted = 0;
    //The total amount of athletes so far we've minted
    uint256 private numAthletes = 0;

    string ipfsBaseUrl = "https://ipfs.io/ipfs/";

    // Starting block for randomized index
    uint256 public startingIndexBlock;
    uint256 public startingIndex;

    //Provenance hash
    string provenance = "";

    // Mappings
    mapping(uint256 => string) private _uris; // token URIs
    mapping(uint256 => uint256) private supplyOfToken; // supply of the given token

    // Events -- later add more for the frontend
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
    function mintAthlete() private {
        // Index of what to mint -- we need to % by num of NFTs per athlete
        uint256 mintIndex = (startingIndex + numAthletes) % NUM_ATHLETES;

        // Log for debugging
        console.log("Starting index", startingIndex);
        console.log("Mint index", mintIndex);

        if (numAthletes < NUM_ATHLETES * NFT_PER_ATHLETE) {
            require(
                supplyOfToken[mintIndex] < NFT_PER_ATHLETE,
                "All of this athlete have already been minted!"
            );

            _mint(address(msg.sender), mintIndex, 1, "0x00");

            supplyOfToken[mintIndex] += 1;
            numAthletes += 1; // BAYC had a func for total supply (b/c ERC721). Just incrementing a state variable here
        }
    }

    // Minting a pack to the current user -- later going to be burned and given 3 random NFTs
    function mintStarterPack() public {
        require(
            starterPacksMinted < MAX_PACKS,
            "All packs have already been minted!"
        );
        require(
            balanceOf(msg.sender, starterPackId) < 1,
            "Can only mint one starter pack per account"
        );

        _mint(address(msg.sender), starterPackId, 1, "");
        setTokenUri(starterPackId, string(abi.encodePacked(starterPackURI)));

        starterPacksMinted += 1;
        emit packMinted(msg.sender, starterPacksMinted);
    }

    function mintBoosterPack() public {
        require(
            boosterPacksMinted < MAX_PACKS,
            "All packs have already been minted!"
        );
        require(
            balanceOf(msg.sender, starterPackId) < 1,
            "Can only mint one starter pack per account"
        );

        _mint(address(msg.sender), boosterPackId, 1, "");
        setTokenUri(boosterPackId, string(abi.encodePacked(boosterPackURI)));

        boosterPacksMinted += 1;
        emit packMinted(msg.sender, boosterPacksMinted);
    }

    // Burning a starter pack and giving random athlete NFTs to sender (one of each position)
    // If uploaded in correct order we should be good (@Isayah)
    function burnStarterPack() public {
        require(packsReadyToOpen, "Packs aren't ready to open yet!");
        require(
            balanceOf(address(msg.sender), starterPackId) == 1,
            "Pack has already been burned or does not exist."
        );

        // Change starting index every time for randomization -- people may be able to game this though...
        // Should we use chainlink instead? Maybe put Trey on figuring this out
        setStartingIndex();

        // Assigning the user 3 NFTs
        for (uint256 i = 0; i < STARTER_PACK_SIZE; i++) {
            mintAthlete();
        }
        // Burning the pack
        _burn(address(msg.sender), starterPackId, 1);
    }

    function burnBoosterPack() public {
        require(packsReadyToOpen, "Packs aren't ready to open yet!");
        require(
            balanceOf(address(msg.sender), boosterPackId) > 0,
            "No remaining booster packs!"
        );

        //  Insert logic to mint athletes in a booster pack

        _burn(address(msg.sender), boosterPackId, 1);
    }

    // Setting starting Index -- will do every time?
    function setStartingIndex() public onlyOwner {
        // Setting the starting index
        startingIndex =
            uint256(blockhash(block.number - 1)) %
            (NUM_ATHLETES * NFT_PER_ATHLETE);
        console.log("Starting index ", startingIndex);

        // Prevent default sequence
        if (startingIndex == 0) {
            startingIndex = startingIndex.add(1);
        }
    }

    // Dynamically setting new URI for a minted token
    function setTokenUri(uint256 tokenId, string memory uri) public onlyOwner {
        require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice");
        _uris[tokenId] = uri;
    }

    // Just getting the URI for a token
    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    // Setting base URIs for the Athletes
    function setURIs() public onlyOwner {
        // Way to check if starting index has been set?
        // require(startingIndex, "Starting index must be set");

        for (uint256 i = 0; i < NUM_ATHLETES; i++) {
            console.log("Starting index is ", startingIndex);
            console.log("num athletes", NUM_ATHLETES);

            uint256 mintIndex = (startingIndex + i) % NUM_ATHLETES;
            console.log("mint index ", mintIndex);

            setTokenUri(
                mintIndex,
                string(
                    abi.encodePacked( // 0.json, 1.json, ...
                        athleteURI,
                        Strings.toString(mintIndex),
                        ".json"
                    )
                )
            );

            console.log("New URI ", _uris[mintIndex]);
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
