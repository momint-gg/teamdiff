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
import "./VRFv2Consumer.sol";

contract GameItems is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    using SafeMath for uint256;

    // Constructor args
    string private athleteURI;
    string private starterPackURI;
    string private boosterPackURI;
    uint256 private NUM_ATHLETES; // Max size of the collection
    uint256 private NFT_PER_ATHLETE; // how much of each athlete
    uint256 private STARTER_PACK_SIZE;
    uint256 private BOOSTER_PACK_SIZE;
    uint256 private MAX_STARTER_PACK_BALANCE;
    uint256 private MAX_BOOSTER_PACK_BALANCE;
    uint256 private MAX_PACKS;
    uint256 public REVEAL_TIMESTAMP = 10000;
    uint64 chainlinkSubId;

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

    // Starting block for randomized index
    uint256 private startingIndexBlock;
    uint256 private startingIndex;

    //Provenance hash
    string provenance = "";

    // Random indices for minting packs
    uint256[5] private starterPackIndices;
    uint256[3] private boosterPackIndices;

    // VRF:
    // VRFv2Consumer public vrf =
    //     VRFv2Consumer(0xce33C9b8d69Fb99a715279503980Cf54f9A57218);
    // address vrfAddress = 0xce33C9b8d69Fb99a715279503980Cf54f9A57218;

    // ======= Events ==========
    event packMinted(address user, uint256 id);
    // event VRFConsumerCreated(address a);
    // event Response(bool success, bytes data);

    struct Parameters {
        uint256 _numAthletes;
        uint256 _nftPerAthlete;
        uint256 _starterPackSize;
        uint256 _boosterPackSize;
        uint256 _maxStarterPackBalance;
        uint256 _maxBoosterPackBalance;
        uint256 _maxPacks;
        uint256 _revealTimestamp;
        // uint64 chainlinkSubId;
    }

    // Mappings
    mapping(uint256 => string) private _uris; // token URIs
    mapping(uint256 => uint256) private supplyOfToken; // supply of the given token

    //NOTE we ran into an error if we have more than 16 params passed in constructor
    constructor(
        Parameters memory params,
        string memory _athleteURI,
        string memory _starterPackURI,
        string memory _boosterPackURI
    ) ERC1155("") {
        console.log("Making contract...");
        NUM_ATHLETES = params._numAthletes;
        NFT_PER_ATHLETE = params._nftPerAthlete;
        STARTER_PACK_SIZE = params._starterPackSize;
        BOOSTER_PACK_SIZE = params._boosterPackSize;
        MAX_STARTER_PACK_BALANCE = params._maxStarterPackBalance;
        MAX_BOOSTER_PACK_BALANCE = params._maxBoosterPackBalance;
        MAX_PACKS = params._maxPacks;
        athleteURI = _athleteURI;
        starterPackURI = _starterPackURI;
        boosterPackURI = _boosterPackURI;
        REVEAL_TIMESTAMP = params._revealTimestamp;
        // vrf = new VRFv2Consumer(params.chainlinkSubId); //chainlink
    }

    // Note: the contract needs to be added as a consumer before we can call this
    // New contract flow for random #:
    //1. We deploy a VRFv2Consumer contract
    //2. When opening on the frontend, we call this function and extract 5 random #s from it
    //3. We then pass these into the
    // function generateRandomNum() public onlyOwner {
    //     //TODO bit shift the random num by the number of bits of the max value of random number that we want
    //     //Does this need to be async? --> Henry: No, solidity is async by default
    //     console.log("Requesting random words...");
    //     vrf.requestRandomWords();
    // }

    // // Note: can only call this if contract has already called generateRandomNum()
    // function returnRandomNum() public onlyOwner returns (uint256) {
    //     return (vrf.s_randomWords(0));
    // }

    // Athletes can only be minted once our "switch" has been flipped
    function setPacksReady() public onlyOwner {
        packsReadyToOpen = !packsReadyToOpen;
    }

    // Mints an athlete -- called when someone "burns" a pack
    function mintAthlete(uint256 index) private {
        // Log for debugging
        // console.log("Mint index ", index);

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
    // Passing in random indices here!
    function burnStarterPack() public {
        require(packsReadyToOpen, "Packs aren't ready to open yet!");
        require(
            balanceOf(address(msg.sender), starterPackId) == 1,
            "Pack has already been burned or does not exist."
        );

        // Indices for players in the pack, 1 of each position
        uint256[5] memory indices = generateStarterPackIndices();

        // Assigning the user their athletes
        for (uint8 i = 0; i < indices.length; i++) {
            mintAthlete(indices[i]);
        }
        // Burning the starter pack
        _burn(address(msg.sender), starterPackId, 1);
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
            uint256 mintIndex = (startingIndex + i) % NUM_ATHLETES;

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
        }

        //Setting pack URIs after the athletes (i.e. 50.json, 51.json)
        setTokenUri(NUM_ATHLETES + 1, string(abi.encodePacked(starterPackURI)));
        setTokenUri(NUM_ATHLETES + 2, string(abi.encodePacked(boosterPackURI)));
    }

    //Generate pseudo random starter pack indices
    function generateStarterPackIndices()
        public
        view
        returns (uint256[5] memory)
    {
        uint256[5] memory indices;
        for (uint256 i = 0; i < indices.length; i++) {
            uint256 start = i * 10;
            uint256 end = i * 10 + 9;
            indices[i] = ((uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        block.difficulty,
                        i
                    )
                )
            ) % (end - start + 1)) + start);
            console.log("index is ", indices[i]);
        }

        return indices;
    }

    // Setting starting index block
    function emergencySetStartingIndexBlock() public onlyOwner {
        require(startingIndex == 0, "Starting index is already set");

        startingIndexBlock = block.number;
    }

    // Setting provenance once it is calculated
    // Set with: (tokenId + startingIndex) % # of tokens
    // Probably won't need this anymore
    function setProvenanceHash(string memory provenanceHash) public onlyOwner {
        provenance = provenanceHash;
    }

    function getNFTPerAthlete() public view onlyOwner returns (uint256) {
        return NFT_PER_ATHLETE;
    }
}
