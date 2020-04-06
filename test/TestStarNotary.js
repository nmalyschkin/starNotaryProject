const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", async accs => {
    accounts = accs;
    owner = accounts[0];
});

it("can Create a Star", async () => {
    const tokenId = 1;
    const instance = await StarNotary.deployed();

    await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
    const starName = await instance.tokenIdToStarInfo.call(tokenId);

    assert.equal(starName, "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
    const instance = await StarNotary.deployed();

    const user1 = accounts[1];
    const starId = 2;

    const starPrice = web3.utils.toWei(".01", "ether");

    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });

    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
    const instance = await StarNotary.deployed();

    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 3;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    const balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    const value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    const value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar("awesome star", starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    const value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
    const instance = await StarNotary.deployed();

    const tokenName = await instance.name.call();
    const tokenSymbol = await instance.symbol.call();

    assert.equal(tokenName, "Star Notary Token");
    assert.equal(tokenSymbol, "SNT");
});

it("lets 2 users exchange stars", async () => {
    const instance = await StarNotary.deployed();

    const user1 = accounts[1];
    const user2 = accounts[2];

    const starId1 = 6;
    const starId2 = 7;

    await instance.createStar("awesome star1", starId1, { from: user1 });
    await instance.createStar("awesome star2", starId2, { from: user2 });

    await instance.exchangeStars(starId1, starId2, { from: user1 });
    await instance.exchangeStars(starId2, starId1, { from: user2 });

    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);
});

it("lets a user transfer a star", async () => {
    const instance = await StarNotary.deployed();

    const tokenId = 8;
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];

    await instance.createStar("Awesome Star!", tokenId, { from: user1 });
    assert.equal(user1, await instance.ownerOf(tokenId));

    await instance.transferStar(user2, tokenId, { from: user1 });
    assert.equal(user2, await instance.ownerOf(tokenId));

    // not owner or previous owner can not transfer star
    let user1CanTransferStar = true;
    try {
        await instance.transferStar(user3, tokenId, { from: user1 });
    } catch (error) {
        user1CanTransferStar = false;
    }

    assert.equal(user1CanTransferStar, false);
});

it("lookUptokenIdToStarInfo test", async () => {
    const tokenId = 9;
    const instance = await StarNotary.deployed();

    await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
    const starName = await instance.lookUptokenIdToStarInfo.call(tokenId);

    assert.equal(starName, "Awesome Star!");
});
