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

    // Constructor args
    uint256 private NUM_ATHLETES; // Max size of the collection
    uint256 private NFT_PER_ATHLETE; // how much of each athlete
    uint256 private STARTER_PACK_SIZE;
    uint256 private BOOSTER_PACK_SIZE;
    uint256 private MAX_STARTER_PACK_BALANCE;
    uint256 private MAX_BOOSTER_PACK_BALANCE;
    uint256 private MAX_PACKS;
    string private athleteURI;
    string private starterPackURI;
    string private boosterPackURI;
    uint256 public REVEAL_TIMESTAMP = 10000;

    // When we flip the switch and let everyone open packs
    // (Setting to true for now for easy testing)
    bool public packsReadyToOpen = true;

    // Where to start pack IDs
    uint256 private starterPackId = NUM_ATHLETES;
    uint256 private boosterPackId = starterPackId;
    // Total amount of packs minted so far
    uint256 private starterPacksMinted;
    uint256 private boosterPacksMinted;
    // The total amount of athletes so far we've minted
    uint256 private numAthletes;

    string ipfsBaseUrl = "https://ipfs.io/ipfs/";

    // Starting block for randomized index
    uint256 private startingIndexBlock;
    uint256 private startingIndex;

    //Provenance hash
    string provenance = "";

    // Random indices for minting packs
    uint256[5] private starterPackIndices;
    uint256[3] private boosterPackIndices;
    uint256 private magicNumber; // "Magic #" for randomizing indices when minting athletes
    uint256 public pseudoRandomNumber;

    // Mappings
    mapping(uint256 => string) private _uris; // token URIs
    mapping(uint256 => uint256) private supplyOfToken; // supply of the given token

    // Events -- later add more for the frontend
    event packMinted(address user, uint256 id);

    constructor(
        uint256 _numAthletes,
        uint256 _nftPerAthlete,
        uint256 _starterPackSize,
        uint256 _boosterPackSize,
        uint256 _maxStarterPackBalance,
        uint256 _maxBoosterPackBalance,
        uint256 _maxPacks,
        string memory _athleteURI,
        string memory _starterPackURI,
        string memory _boosterPackURI,
        uint256 _revealTimestamp
    ) ERC1155("") {
        console.log("Making contract...");
        NUM_ATHLETES = _numAthletes;
        NFT_PER_ATHLETE = _nftPerAthlete;
        STARTER_PACK_SIZE = _starterPackSize;
        BOOSTER_PACK_SIZE = _boosterPackSize;
        MAX_STARTER_PACK_BALANCE = _maxStarterPackBalance;
        MAX_BOOSTER_PACK_BALANCE = _maxBoosterPackBalance;
        MAX_PACKS = _maxPacks;
        athleteURI = _athleteURI;
        starterPackURI = _starterPackURI;
        boosterPackURI = _boosterPackURI;
        REVEAL_TIMESTAMP = _revealTimestamp;
    }

    // Athletes can only be minted once our "switch" has been flipped
    function setPacksReady() public onlyOwner {
        packsReadyToOpen = !packsReadyToOpen;
    }

    // Mints an athlete -- called when someone "burns" a pack
    function mintAthlete(uint256 index) private {
        // Index of what to mint -- we need to % by num of NFTs per athlete
        // uint256 mintIndex = (startingIndex + numAthletes) % NUM_ATHLETES;

        // Log for debugging
        console.log("Starting index ", startingIndex);
        console.log("New mint index ", index);

        if (numAthletes < NUM_ATHLETES * NFT_PER_ATHLETE) {
            require(
                supplyOfToken[index] < NFT_PER_ATHLETE,
                "All of this athlete have already been minted!"
            );

            _mint(address(msg.sender), index, 1, "0x00");

            supplyOfToken[index] += 1;
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

        boosterPacksMinted += 1;
        emit packMinted(msg.sender, boosterPacksMinted);
    }

    // Burning a starter pack and giving random athlete NFTs to sender (one of each position)
    // We also will determine which indices to mint
    function burnStarterPack() public {
        require(packsReadyToOpen, "Packs aren't ready to open yet!");
        require(
            balanceOf(address(msg.sender), starterPackId) == 1,
            "Pack has already been burned or does not exist."
        );

        // Generating new indices for the athletes minted when the pack is burned
        generateStarterPackIndices();

        // Assigning the user 3 NFTs
        for (uint8 i = 0; i < starterPackIndices.length; i++) {
            mintAthlete(starterPackIndices[i]);
        }
        // Burning the pack
        _burn(address(msg.sender), starterPackId, 1);
    }

    // Generates array of indices (e.g. sets starterPackIndices to [0, 5, 22, 13, 9])
    // We assume one position is 0-9 on IPFS, other is 10-19, etc...
    // Note: starting index must be set first
    // ALSO need to eliminate possibility of duplicates
    function generateStarterPackIndices() public onlyOwner {
        // Where we're going to be requesting randomness from chainlink
        uint8[5] memory randomIndices = [2, 12, 27, 36, 49];

        for (uint256 i = 0; i < starterPackIndices.length; i++) {
            starterPackIndices[i] = randomIndices[i];
        }
    }

    function burnBoosterPack() public {
        require(packsReadyToOpen, "Packs aren't ready to open yet!");
        require(
            balanceOf(address(msg.sender), boosterPackId) > 0,
            "No remaining booster packs!"
        );

        //  Insert logic to mint athletes in a booster pack
        //for x in booster pack size, ......
        _burn(address(msg.sender), boosterPackId, 1);
    }

    // Setting starting Index -- will do every time?
    function setStartingIndex() public onlyOwner {
        // Setting the starting index
        startingIndex =
            uint256(blockhash(block.number - 1)) %
            (NUM_ATHLETES * NFT_PER_ATHLETE);

        // Prevent default sequence
        if (startingIndex == 0) {
            startingIndex = startingIndex.add(1);
        }
    }

    // Use this until we figure out randomness
    function randomPlaceholder() public onlyOwner returns (uint256) {
        uint256 randomnumber = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % 900;
        pseudoRandomNumber = randomnumber + 1;
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
        //Setting athlete URIs
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

        //Setting pack URIs
        setTokenUri(NUM_ATHLETES + 1, string(abi.encodePacked(starterPackURI)));
        setTokenUri(NUM_ATHLETES + 2, string(abi.encodePacked(boosterPackURI)));
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

    function getStarterPackIndices()
        public
        view
        onlyOwner
        returns (uint256[5] memory)
    {
        return starterPackIndices;
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
