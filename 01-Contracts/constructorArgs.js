//Where out constructor arguments are going to go for verification
module.exports = [
  4, //NUM_ATHLETES
  10, // NFT_PER_ATHLETE
  5, // STARTER_PACK_SIZE
  3, // BOOSTER_PACK_SIZE
  1, // MAX_STARTER_PACK_BALANCE
  2, // MAX_BOOSTER_PACK_BALANCE
  10, // MAX_PACKS,
  "https://gateway.pinata.cloud/ipfs/QmV6Bt7xVz468sD7pgAYXHJqSDpPuymMVnpb2Tuk58zXVU/", // athleteURI (pinata url)
  "https://ipfs.io/ipfs/QmW4HEz39zdzFDigDa18SzwSzUejCf2i4dN3Letfzar6gH?filename=pack.json", // starterPackURI (pinata url)
  "Insert booster pack URI here :)", // boosterPackURI (pinata url)
  10000, // REVEAL_TIMESTAMP,
];
