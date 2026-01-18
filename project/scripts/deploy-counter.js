import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  
  const address = await counter.getAddress();
  console.log("Counter deployed to:", address);

  const initialValue = await counter.x();
  console.log("Initial value:", initialValue.toString());
  
  const tx = await counter.inc();
  await tx.wait();
  
  const newValue = await counter.x();
  console.log("Value after increment:", newValue.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
