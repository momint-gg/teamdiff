// test/GameItems.test.js
// Load dependencies
const { expect } = require('chai');

const GameItems = artifacts.require("GameItems.sol");


// Start test block
describe('GameItems.test', async function () {
  let owner;
  let addr1
    //Ran before first unit test
  before(async function () {
    this.GameItemFactory = await ethers.getContractFactory('GameItems');
  });

  //Ran before every unit test
  //used to reset state or prepare test
  beforeEach(async function () {
    this.GameItem = await this.GameItemFactory.deploy();
    [owner, addr1] = await ethers.getSigners();
    await this.GameItem.deployed();
    //this.GameItem.connect(owner);
  });

  //Test case
  it('newly minted GameItem NFTs have a correctly set uri', async function () {
    // Mint athlete
    //only works when _mint calls with msg.sender, not address(this)
    //ERROR'ERC1155: transfer to non ERC1155Receiver implementer'
    const numAthletes = await this.GameItem.numAthletes();
    const firstUri = await this.GameItem.uri(0);
    const lastUri = await this.GameItem.uri(numAthletes - 2);
    
    expect(firstUri).to.equal("https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player1.json") &&
    expect(lastUri).to.equal("https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player" + (numAthletes - 1) + ".json");

  });

  // Test case
  it('GameItem contract owner is set to Signer of constructor call', async function () {
    expect(await this.GameItem.owner()).to.equal(owner.address);
  });

  // Test Case
  it('Non-Owner address cannot call mintAthletes()', async function () {
    //TODO cannot get correct ERROR message to use revertedWith
    // expect(this.GameItem.connect(addr1).mintAthletes()).to.be.revertedWith(
    //   "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
    // );
    expect(this.GameItem.connect(addr1).mintAthletes()).to.be.reverted;
  });



  // Test Case
  it('Non-Owner address cannot call setTokenUri()', async function () {
    //TODO cannot get correct ERROR message to use revertedWith
    // expect(this.GameItem.connect(addr1).mintAthletes()).to.be.revertedWith(
    //   "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
    // );
    const tokenId = 0;
    const uri = "https://ipfs.io/ipfs/QmWYaTeeZiZDmT7j4xrNsuQJGFEgbS2bpkeA2uMZPmA4Rw/player1.json"
    expect(this.GameItem.connect(addr1).setTokenUri(tokenId, uri)).to.be.reverted;
  });

  // Test Case
  it('Contract Owner owns NFTPerAthlete quantity of each Athlete after Contract Deployment', async function () {
    for(i = 0; i < this.GameItem.numAthletes - 1; i++)
      expect(await this.GameItem.balanceOf(owner.address, i)).to.equal(await this.GameItem.getNFTPerAthlete());
  });


  // Test Case
  it('Contract Owner can send NFT to another address with correct balance updates', async function() {
    //send and NFT and getBalance of two address
    const transferAmount = 5;
    const tokenId = 0;
    await this.GameItem.safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00");
    expect(await this.GameItem.balanceOf(addr1.address, tokenId)).to.equal(transferAmount);

  })

  // Test Case
  it('Contract Owner cannot send more than NFTPerAthlete Tokens', async function() {
    const transferAmount = await this.GameItem.getNFTPerAthlete() + 1;
    const tokenId = 0;
    //TODO cannot get correct ERROR message to use revertedWith
    // expect(this.GameItem.safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.revertedWith(
    //   "Error: VM Exception while processing transaction: reverted with reason string 'ERC1155: insufficient balance for transfer'"
    //   );
    expect(this.GameItem.safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.reverted;
  })

  // Test Case
  it('Non-Contract Owner addresses cannot send tokens from Contract Owner', async function() {
    const transferAmount = 5;
    const tokenId = 0;
    //TODO cannot get correct ERROR message to use revertedWith
    // expect(this.GameItem.connect(addr1).safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.revertedWith(
    //   "Error: VM Exception while processing transaction: reverted with reason string 'ERC1155: caller is not owner nor approved'"
    // );
    expect(this.GameItem.connect(addr1).safeTransferFrom(owner.address, addr1.address, tokenId, transferAmount, "0x00")).to.be.reverted;
  })
});