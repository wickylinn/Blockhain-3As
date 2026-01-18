import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Counter", function () {
  let counter;

  before(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy();
    await counter.waitForDeployment();
  });

  it("Should start at 0", async function () {
    const value = await counter.x();
    expect(value).to.equal(0);
  });

  it("Should increment correctly", async function () {
    const before = await counter.x();
    await counter.inc();
    const after = await counter.x();
    expect(after).to.equal(before + 1n);
  });

  it("Should increment by 5 correctly", async function () {
    const before = await counter.x();
    await counter.incBy(5);
    const after = await counter.x();
    expect(after).to.equal(before + 5n);
  });
});