const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
//npx hardhat coverage
describe("SimpleStorage", function() {
  let simpleStorageFactory, simpleStorage;

  beforeEach(async function() {
    simpleStorageFactory =  await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await simpleStorageFactory.deploy();
  })

  it("Should start with a favorite number of zero", async function() {
    const currentValue = await simpleStorage.retrieve();
    const expectedValue = "0";
    assert.equal(currentValue.toString(), expectedValue);
    //expect(currentValue.toString()).to.equal(expectedValue);
  });

  //it.only("Should update when we call store", async function() the .only extension method means run only this test when the test runner is started again
  it("Should update when we call store", async function() {
    const expectedValue = "7";
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait(1);
    const currentValue = await simpleStorage.retrieve();
    assert.equal(currentValue.toString(), expectedValue);
  });
});