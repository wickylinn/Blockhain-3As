import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Token", function () {
  let token;
  let deployer;
  let account1;
  let account2;
  const initialSupply = ethers.parseEther("1000000");
  const tokenName = "Test Token";
  const tokenSymbol = "TEST";
  const decimals = 18;

  before(async function () {
    const [deployerAddr, account1Addr, account2Addr] = await ethers.getSigners();
    deployer = deployerAddr;
    account1 = account1Addr;
    account2 = account2Addr;

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenName, tokenSymbol, decimals, initialSupply);
    await token.waitForDeployment();
  });

  describe("Basic Balance Checks", function () {
    it("Should set correct initial supply", async function () {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(initialSupply);
    });

    it("Should assign all tokens to deployer", async function () {
      const deployerBalance = await token.balanceOf(deployer.address);
      expect(deployerBalance).to.equal(initialSupply);
    });

    it("Should have zero balance for other accounts initially", async function () {
      const account1Balance = await token.balanceOf(account1.address);
      const account2Balance = await token.balanceOf(account2.address);
      expect(account1Balance).to.equal(0);
      expect(account2Balance).to.equal(0);
    });

    it("Should have correct token metadata", async function () {
      expect(await token.name()).to.equal(tokenName);
      expect(await token.symbol()).to.equal(tokenSymbol);
      expect(await token.decimals()).to.equal(decimals);
    });
  });

  describe("Transfer Tests", function () {
    it("Should transfer tokens successfully", async function () {
      const transferAmount = ethers.parseEther("100");
      const deployerBalanceBefore = await token.balanceOf(deployer.address);
      const account1BalanceBefore = await token.balanceOf(account1.address);

      await token.transfer(account1.address, transferAmount);

      const deployerBalanceAfter = await token.balanceOf(deployer.address);
      const account1BalanceAfter = await token.balanceOf(account1.address);

      expect(deployerBalanceAfter).to.equal(deployerBalanceBefore - transferAmount);
      expect(account1BalanceAfter).to.equal(account1BalanceBefore + transferAmount);
    });

    it("Should update total supply correctly after transfers", async function () {
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(initialSupply);
    });

    it("Should transfer to multiple accounts", async function () {
      const transferAmount1 = ethers.parseEther("50");
      const transferAmount2 = ethers.parseEther("25");

      await token.connect(account1).transfer(account2.address, transferAmount1);
      await token.connect(deployer).transfer(account2.address, transferAmount2);

      const account2Balance = await token.balanceOf(account2.address);
      expect(account2Balance).to.equal(transferAmount1 + transferAmount2);
    });
  });

  describe("Failing Transfer Tests", function () {
    it("Should revert when transferring more than balance", async function () {
      const account1Balance = await token.balanceOf(account1.address);
      const excessAmount = account1Balance + ethers.parseEther("1");

      await expect(
        token.connect(account1).transfer(account2.address, excessAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert when transferring from zero balance account", async function () {
      const zeroBalanceAccount = account2;
      const transferAmount = ethers.parseEther("1");

      const balance = await token.balanceOf(zeroBalanceAccount.address);
      if (balance === 0n) {
        await expect(
          token.connect(zeroBalanceAccount).transfer(account1.address, transferAmount)
        ).to.be.revertedWith("Insufficient balance");
      }
    });
  });

  describe("Edge Case: Transferring to Yourself", function () {
    it("Should allow transferring to yourself", async function () {
      const account1BalanceBefore = await token.balanceOf(account1.address);
      const transferAmount = ethers.parseEther("10");

      await token.connect(account1).transfer(account1.address, transferAmount);

      const account1BalanceAfter = await token.balanceOf(account1.address);
      expect(account1BalanceAfter).to.equal(account1BalanceBefore);
    });

    it("Should emit Transfer event when transferring to yourself", async function () {
      const transferAmount = ethers.parseEther("5");

      await expect(token.connect(account1).transfer(account1.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(account1.address, account1.address, transferAmount);
    });
  });

  describe("Gas Estimation Tests", function () {
    it("Should estimate gas for transfer", async function () {
      const transferAmount = ethers.parseEther("100");
      const gasEstimate = await token.transfer.estimateGas(account1.address, transferAmount);

      expect(gasEstimate).to.be.gt(0);
    });

    it("Should estimate gas for approve", async function () {
      const approveAmount = ethers.parseEther("1000");
      const gasEstimate = await token.approve.estimateGas(account1.address, approveAmount);

      expect(gasEstimate).to.be.gt(0);
    });

    it("Should measure actual gas used in transfer", async function () {
      const transferAmount = ethers.parseEther("50");
      const tx = await token.transfer(account2.address, transferAmount);
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;
      expect(receipt.gasUsed).to.be.gt(0);
    });
  });

  describe("Event Emission Tests", function () {
    it("Should emit Transfer event on successful transfer", async function () {
      const transferAmount = ethers.parseEther("200");

      await expect(token.transfer(account1.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(deployer.address, account1.address, transferAmount);
    });

    it("Should emit Approval event on approve", async function () {
      const approveAmount = ethers.parseEther("500");

      await expect(token.approve(account1.address, approveAmount))
        .to.emit(token, "Approval")
        .withArgs(deployer.address, account1.address, approveAmount);
    });

    it("Should emit Transfer event on transferFrom", async function () {
      const approveAmount = ethers.parseEther("300");
      const transferAmount = ethers.parseEther("200");

      await token.approve(account1.address, approveAmount);
      
      await expect(token.connect(account1).transferFrom(deployer.address, account2.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(deployer.address, account2.address, transferAmount);
    });
  });

  describe("Storage Verification", function () {
    it("Should update balanceOf mapping after transfer", async function () {
      const transferAmount = ethers.parseEther("150");
      const deployerBalanceBefore = await token.balanceOf(deployer.address);
      const account2BalanceBefore = await token.balanceOf(account2.address);

      await token.transfer(account2.address, transferAmount);

      const deployerBalanceAfter = await token.balanceOf(deployer.address);
      const account2BalanceAfter = await token.balanceOf(account2.address);

      expect(deployerBalanceAfter).to.equal(deployerBalanceBefore - transferAmount);
      expect(account2BalanceAfter).to.equal(account2BalanceBefore + transferAmount);
    });

    it("Should update allowance mapping after approve", async function () {
      const approveAmount = ethers.parseEther("250");
      
      await token.approve(account1.address, approveAmount);
      
      const allowance = await token.allowance(deployer.address, account1.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("Should update allowance after transferFrom", async function () {
      const approveAmount = ethers.parseEther("400");
      const transferAmount = ethers.parseEther("150");

      await token.approve(account1.address, approveAmount);
      await token.connect(account1).transferFrom(deployer.address, account2.address, transferAmount);

      const remainingAllowance = await token.allowance(deployer.address, account1.address);
      expect(remainingAllowance).to.equal(approveAmount - transferAmount);
    });

    it("Should maintain totalSupply constant", async function () {
      const totalSupplyBefore = await token.totalSupply();
      
      await token.transfer(account1.address, ethers.parseEther("100"));
      
      const totalSupplyAfter = await token.totalSupply();
      expect(totalSupplyAfter).to.equal(totalSupplyBefore);
    });
  });

  describe("Negative Tests (Reverts, Asserts, Incorrect Parameters)", function () {
    it("Should revert transfer with insufficient balance", async function () {
      const largeAmount = ethers.parseEther("10000000");
      
      await expect(
        token.connect(account1).transfer(account2.address, largeAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert transferFrom with insufficient balance", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("1000000");

      await token.connect(account1).approve(deployer.address, approveAmount);
      
      await expect(
        token.transferFrom(account1.address, account2.address, transferAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should revert transferFrom with insufficient allowance", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("200");

      await token.connect(account1).approve(deployer.address, approveAmount);
      
      await expect(
        token.transferFrom(account1.address, account2.address, transferAmount)
      ).to.be.revertedWith("Insufficient allowance");
    });

    it("Should revert transferFrom with zero allowance", async function () {
      const transferAmount = ethers.parseEther("100");
      
      await token.connect(account1).approve(deployer.address, 0);

      await expect(
        token.transferFrom(account1.address, account2.address, transferAmount)
      ).to.be.revertedWith("Insufficient allowance");
    });
  });
});
