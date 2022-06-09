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

// Contains the logic for minting / burning our 1155s
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
    string public name = "TeamDiff";

    // When we flip the switch and let everyone open packs
    bool public packsReadyToOpen = false;

    // Total amount of packs minted so far
    uint256 private starterPacksMinted;
    uint256 private boosterPacksMinted;
    // The total amount of athletes so far we've minted
    uint256 private numAthletes;

    // Starting block for randomized index
    uint256 private startingIndexBlock;
    uint256 private startingIndex;

    // Provenance hash
    string provenance = "";

    // Random indices for minting packs
    uint256[5] private starterPackIndices;
    uint256[3] private boosterPackIndices;

    // Events
    event packMinted(address signer, uint256 id);
    event packBurned(uint256[5], address signer);

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

    // TODO show how many packs are still available
    // TODO add boolean to show if packs are available.
    uint256 public packsAvailable;

    // Our whitelist
    mapping(address => bool) public whitelist;
    uint256 public numWhitelisted;
    bool isPresalePhase = false;

    // Mappings
    mapping(uint256 => string) private _uris; // token URIs
    mapping(uint256 => uint256) private supplyOfToken; // supply of the given token
    mapping(address => bool) public userToHasBurnedPack;
    mapping(address => bool) public userToHasMintedPack;

    //NOTE we ran into an error if we have more than 16 params passed in constructor
    constructor(
        Parameters memory params,
        string memory _athleteURI,
        string memory _starterPackURI,
        string memory _boosterPackURI
    ) ERC1155("TD") {
        NUM_ATHLETES = params._numAthletes;
        NFT_PER_ATHLETE = params._nftPerAthlete;
        STARTER_PACK_SIZE = params._starterPackSize;
        BOOSTER_PACK_SIZE = params._boosterPackSize;
        MAX_STARTER_PACK_BALANCE = params._maxStarterPackBalance;
        MAX_BOOSTER_PACK_BALANCE = params._maxBoosterPackBalance;
        MAX_PACKS = params._maxPacks;
        MAX_BOOSTER_PACKS = 500; //
        athleteURI = _athleteURI;
        starterPackURI = _starterPackURI;
        boosterPackURI = _boosterPackURI;
        REVEAL_TIMESTAMP = params._revealTimestamp;
        packsAvailable = MAX_PACKS;
    }

    // Athletes can only be minted once our "switch" has been flipped
    function setPacksReady() public onlyOwner {
        packsReadyToOpen = !packsReadyToOpen;
    }

    /*****************************************************/
    /******************* WHITELIST ***********************/
    /*****************************************************/
    function addUserToWhitelist(address _userToAdd)
        public
        onlyOwner
        returns (bool success)
    {
        if (!whitelist[_userToAdd]) {
            whitelist[_userToAdd] = true;
            numWhitelisted += 1;
            success = true;
        }
    }

    function addUsersToWhitelist(address[] memory addrs)
        public
        onlyOwner
        returns (bool success)
    {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (addUserToWhitelist(addrs[i])) {
                success = true;
            }
        }
    }

    function removeUserFromWhitelist(address _userToRemove)
        public
        onlyOwner
        returns (bool success)
    {
        if (whitelist[_userToRemove]) {
            whitelist[_userToRemove] = false;
            numWhitelisted -= 1;
            success = true;
        }
    }

    function removeUsersFromWhitelist(address[] memory addrs)
        public
        onlyOwner
        returns (bool success)
    {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (removeUserFromWhitelist(addrs[i])) {
                success = true;
            }
        }
    }

    function getNumWhitelisted() public view returns (uint256) {
        return numWhitelisted;
    }

    modifier onlyWhitelisted() {
        // In our case, whitelisted can also mean nobody has been added to the whitelist and nobody besides the league creator
        require(whitelist[msg.sender], "User is not whitelisted.");
        _;
    }

    /*****************************************************/
    /************ STARTER PACK MINTING/BURNING ***********/
    /*****************************************************/

    // Minting a pack to the current user -- later going to be burned and given 3 random NFTs
    function mintStarterPack() public  {
        if(isPresalePhase) {
            require(whitelist[msg.sender], "User is not whitelisted.");
        }
        require(
            starterPacksMinted < MAX_PACKS,
            "All packs have already been minted!"
        );
        require(
            !userToHasMintedPack[msg.sender],
            "Can only mint one starter pack per account"
        );
        userToHasMintedPack[msg.sender] = true;

        // Making the index 1 after the athlet  es end
        uint256 starterPackId = NUM_ATHLETES;
        _mint(msg.sender, starterPackId, 1, "0x00");



        starterPacksMinted += 1;
        packsAvailable -= 1;
        emit packMinted(msg.sender, starterPacksMinted);
    }

    // Burning a starter pack and giving random athlete NFTs to sender (one of each position)
    // Passing in random indices here!
    function burnStarterPack() public  {
        uint256 starterPackId = NUM_ATHLETES;
        require(!userToHasBurnedPack[msg.sender], "You cannot burn more than 1 pack");
        require(packsReadyToOpen, "Packs aren't ready to open yet!");
        require(
            balanceOf(address(msg.sender), starterPackId) > 0,
            "Starter pack does not exist in users wallet"
        );

        userToHasBurnedPack[msg.sender] = true;

        // Indices for players in the pack, 1 of each position
        uint256[5] memory indices = generateStarterPackIndices();

        // Assigning the user their athletes
        for (uint8 i = 0; i < indices.length; i++) {
            mintAthlete(indices[i]);
        }

        _burn(msg.sender, starterPackId, 1);

        emit packBurned(indices, msg.sender);
    }

    // Mints an athlete -- called when someone "burns" a pack
    // TODO switch back to private for rpod
    function mintAthlete(uint256 index) public {
        if (numAthletes < NUM_ATHLETES * NFT_PER_ATHLETE) {
            require(
                supplyOfToken[index] < NFT_PER_ATHLETE,
                "All of this athlete have already been minted!"
            );

            _mint(msg.sender, index, 1, "0x00");

            supplyOfToken[index] += 1;
            numAthletes += 1;
        }
    }

    /*****************************************************/
    /************ BOOSTER PACK MINTING/BURNING ***********/
    /*****************************************************/
    function mintBoosterPack() public {
        require(boosterPacksReadyToOpen, "Booster packs cannot be opened yet!");
        require(
            boosterPacksMinted < MAX_BOOSTER_PACKS, // TODO: Set MAX_BOOSTER_PACKS Value in constructor
            "All booster packs have already been minted!"
        );
        require(
            usersBoosterPacksMinted[msg.sender] < 2,
            "Can only mint two booster packs per account"
        );
        usersBoosterPacksMinted[msg.sender]++;
        uint256 boosterPackId = NUM_ATHLETES + 1;

        _mint(msg.sender, boosterPackId, 1, "");

        boosterPacksMinted += 1;
        emit packMinted(msg.sender, boosterPacksMinted);
    }

    function burnBoosterPack() public {
        uint256 boosterPackId = NUM_ATHLETES + 1;
        require(boosterPacksReadyToOpen, "Packs aren't ready to open yet!");
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

    //Generate pseudo random booster pack indices
    function generateBoosterPackIndices()
        private
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

    /**********************************************/
    /************ SETTING URIS, INDICES ***********/
    /**********************************************/

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

        //Setting pack URIs after the athletes (i.e. 49.json = last athlete, 50.json = starter pack)
        setTokenUri(NUM_ATHLETES, string(abi.encodePacked(starterPackURI)));
    }

    // Generate pseudo random starter pack indices (randomness not super important here)
    function generateStarterPackIndices()
        private
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

    function getNFTPerAthlete() public view returns (uint256) {
        return NFT_PER_ATHLETE;
    }

    /***********************************************/
    /************ BOOSTER PACK FUNCTIONS ***********/
    /***********************************************/
    //  function mintBoosterPack() public {
    //         uint256 boosterPackId = NUM_ATHLETES + 1;
    //         require(
    //             boosterPacksMinted < MAX_PACKS,
    //             "All packs have already been minted!"
    //         );
    //         require(
    //             balanceOf(msg.sender, boosterPackId) < 2,
    //             "Can only mint two booster packs per account"
    //         );

    //         _mint(msg.sender, boosterPackId, 1, "");

    //         boosterPacksMinted += 1;
    //         emit packMinted(msg.sender, boosterPacksMinted);
    //     }

    // function burnBoosterPack() public {
    //     uint256 boosterPackId = NUM_ATHLETES + 1;

    //     require(packsReadyToOpen, "Packs aren't ready to open yet!");
    //     require(
    //         balanceOf(address(msg.sender), boosterPackId) > 0,
    //         "No remaining booster packs!"
    //     );

    //     uint256[3] memory indices = generateBoosterPackIndices();

    //     for (uint8 i = 0; i < indices.length; i++) {
    //         mintAthlete(indices[i]);
    //     }

    //     _burn(address(msg.sender), boosterPackId, 1);
    // }

    // //Generate pseudo random booster pack indices
    // function generateBoosterPackIndices()
    //     private
    //     view
    //     returns (uint256[3] memory)
    // {
    //     uint256[3] memory indices;
    //     uint256 startI = block.number % 5; //Find the start index for booster pack athlete type (somewhere 1->5)

    //     for (uint256 i = 0; i < 3; i++) {
    //         startI = startI % 5;
    //         uint256 start = startI * 10;
    //         uint256 end = startI * 10 + 9;

    //         indices[i] = ((uint256(
    //             keccak256(
    //                 abi.encodePacked(
    //                     block.timestamp,
    //                     msg.sender,
    //                     block.difficulty,
    //                     i,
    //                     boosterPacksMinted
    //                 )
    //             )
    //         ) % (end - start + 1)) + start);

    //         startI += 1;
    //     }
    //     return indices;
    // }
}
