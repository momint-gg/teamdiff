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
    using SafeMath for uint256;

    // Constructor args
    string private athleteURI;
    string private starterPackURI;
    string private boosterPackURI;
    // Constants
    uint256 private STARTER_PACK_SIZE;
    uint256 private BOOSTER_PACK_SIZE;
    uint256 private MAX_STARTER_PACK_BALANCE;
    uint256 private MAX_BOOSTER_PACK_BALANCE;
    uint256 private MAX_PACKS;
    uint256 private NUM_ATHLETES;
    uint256 private NFT_PER_ATHLETE;
    uint256 chainlinkSubId;
    uint256 public REVEAL_TIMESTAMP = 10000;

    // When we flip the switch and let everyone open packs
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
    event packMinted(address signer, uint256 id);
    event packBurned(uint256[5], address signer);

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

    //TODO show how many packs are still available
    //TODO add boolean to show if packs are available.
    uint256 public packsAvailable;

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
        packsAvailable = MAX_PACKS;
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
            //TODO add callback to hook onto frontend
            //
            supplyOfToken[index] += 1;
            numAthletes += 1; // BAYC had a func for total supply (b/c ERC721). Just incrementing a state variable here
        }
    }

    // Minting a pack to the current user -- later going to be burned and given 3 random NFTs
    function mintStarterPack() public {
//        require(
//            starterPacksMinted < MAX_PACKS,
//            "All packs have already been minted!"
//        );
//        require(
//            balanceOf(msg.sender, starterPackId) < 1,
//            "Can only mint one starter pack per account"
//        );

        _mint(address(msg.sender), starterPackId, 1, "");

        starterPacksMinted += 1;
        packsAvailable -= 1;
        emit packMinted(msg.sender, starterPacksMinted);
    }

    function mintBoosterPack() public {
        require(
            boosterPacksMinted < MAX_PACKS,
            "All packs have already been minted!"
        );
        require(
            balanceOf(msg.sender, boosterPackId) < 2,
            "Can only mint two booster packs per account"
        );

        _mint(address(msg.sender), boosterPackId, 1, "");

        boosterPacksMinted += 1;
        emit packMinted(msg.sender, boosterPacksMinted);
    }

    // Burning a starter pack and giving random athlete NFTs to sender (one of each position)
    // Passing in random indices here!

    function burnStarterPack() public {
//        require(packsReadyToOpen, "Packs aren't ready to open yet!");
//        require(
//            balanceOf(address(msg.sender), starterPackId) == 1,
//            "Pack has already been burned or does not exist."
//        );

        // Indices for players in the pack, 1 of each position
        uint256[5] memory indices = generateStarterPackIndices();

        // Assigning the user their athletes
        for (uint8 i = 0; i < indices.length; i++) {
            mintAthlete(indices[i]);
        }
        emit packBurned(indices, msg.sender);
        // Burning the starter pack
        _burn(address(msg.sender), starterPackId, 1);
    }

    function burnBoosterPack() public {
        require(packsReadyToOpen, "Packs aren't ready to open yet!");
        require(
            balanceOf(address(msg.sender), boosterPackId) > 0,
            "No remaining booster packs!"
        );

        uint256[3] memory indices = generateBoosterPackIndices();

        for (uint8 i = 0; i < indices.length; i++) {
            mintAthlete(indices[i]);
        }

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
                        i,
                        starterPacksMinted
                    )
                )
            ) % (end - start + 1)) + start);
        }
        return indices;
    }

    //Generate pseudo random booster pack indices
    function generateBoosterPackIndices()
        public
        view
        returns (uint256[3] memory)
    {
        uint256[3] memory indices;
        uint256 startI = block.number % 5; //Find the start index for booster pack athlete type (somewhere 1->5)

        for (uint256 i = 0; i < 3; i++) {
            startI = startI % 5;
            uint256 start = startI * 10;
            uint256 end = startI * 10 + 9;

            indices[i] = ((uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        block.difficulty,
                        i,
                        boosterPacksMinted
                    )
                )
            ) % (end - start + 1)) + start);

            startI += 1;
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
