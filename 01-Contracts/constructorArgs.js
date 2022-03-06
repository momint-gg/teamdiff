//Where out constructor arguments are going to go for verification
module.exports = [
  // Params array
  [
    50, //NUM_ATHLETES
    10, // NFT_PER_ATHLETE
    5, // STARTER_PACK_SIZE
    3, // BOOSTER_PACK_SIZE
    1, // MAX_STARTER_PACK_BALANCE
    2, // MAX_BOOSTER_PACK_BALANCE
    100, // MAX_PACKS,
    10000, // REVEAL_TIMESTAMP,
    697, // Chainlink sub ID
  ],
  "https://gateway.pinata.cloud/ipfs/QmdHMLC2Q5RNBcrnH3YREn3xNBAg3ovaXNB1rFCS36H3Ux/", // athleteURI (pinata url)
  "https://gateway.pinata.cloud/ipfs/QmVaHk5vQJnbZNmcrdh66G6zaB9WSTLX8ZXeVd8WbyPKKW/", // starterPackURI (pinata url)
  "Insert booster pack URI here :)", // boosterPackURI (pinata url)
];
