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
  // Note: You should run the whitelist test to see if these URIs work correctly in mint flow
  "https://gateway.pinata.cloud/ipfs/QmU6abUW6Jegr2VHUafpAvGCdGA3h7UL1ih4ZL9TV6YcHq/", // athleteURI (pinata url)
  "https://gateway.pinata.cloud/ipfs/QmXgkKXsTyW9QJCHWsgrt2BW7p5csfFE21eWtmbd5Gzbjr/", // starterPackURI (pinata url)
  "", // boosterPackURI (v2)
];
