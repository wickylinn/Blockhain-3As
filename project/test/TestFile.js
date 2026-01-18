import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("ContractExample", function () {
  let contract;

  before(async function () {
    const ContractExample = await ethers.getContractFactory("ContractExample");
    contract = await ContractExample.deploy();
    await contract.waitForDeployment();
  });

  it("Should set and get a value", async function () {
    await contract.set(42);
    const value = await contract.get();
    expect(value).to.equal(42);
  });
});