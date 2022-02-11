const crypto = require("crypto-js");

const totalUniqueTokens = 3; //Just # of images we have for example the

const calculateProvenance = async () => {
  const concatenatedHashes = [];
  for (let tokenId = 1; tokenId <= totalUniqueTokens; tokenId += 1) {
    const hash = crypto.SHA256(
      `https://ipfs.io/ipfs/QmVwNeMaU8AdB7E3UKwKD9FYpXD4vLimv2kQ1fFBMKDFNt/athlete${tokenId}.json`
    );
    concatenatedHashes.push(hash);
    console.log(tokenId, hash);
  }

  const provenance = crypto.SHA256(concatenatedHashes);
  console.log(`Concatenated Hashes: ${concatenatedHashes}`);
  console.log(`Provenance hash: ${provenance}`);

  return provenance;
};

const execute = async () => {
  try {
    await calculateProvenance();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

execute();
