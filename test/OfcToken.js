const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OfcToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOfcToken() {
    const [deployer, artist, other, other2] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const OfcToken = await ethers.getContractFactory("OfcToken");
    const token = await OfcToken.deploy("OfcToken", "OFC", artist.address, 750);

    return { owner: deployer, artist, ofc: token, other, other2 };
  }

  describe("Sales state", function () {
    // it("Should set the right unlockTime", async function () {
    //   const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);
    //   expect(await lock.unlockTime()).to.equal(unlockTime);
    // });
    it("Should be toggled", async function () {
      const { ofc, owner, artist, other } = await loadFixture(deployOfcToken);
      const saleState = await ofc.saleActive();
      await ofc.connect(owner).toggleSaleState();
      expect(await ofc.saleActive()).to.equal(!saleState);
    });

    it("Should be minted", async function () {
      const { ofc, owner, artist, other } = await loadFixture(deployOfcToken);
      await ofc.connect(owner).toggleSaleState();

      const result = await expect(
        ofc.connect(owner).mintToken()
      ).to.changeTokenBalance(ofc, owner, 1);
      console.log("tokenId", result);
    });

    it("Should not be minted", async function () {
      const { ofc, owner, artist, other } = await loadFixture(deployOfcToken);
      await expect(ofc.connect(other).mintToken()).to.revertedWith(
        "Sales is closed at the moment."
      );
    });

    it("Sould be transfered", async function () {
      const { ofc, owner, artist, other, other2 } = await loadFixture(
        deployOfcToken
      );
      await ofc.connect(owner).toggleSaleState();
      const result = await expect(
        ofc.connect(other).mintToken()
      ).to.changeTokenBalance(ofc, other, 1);

      await ofc.connect(other).approve(other2.address, 1);

      await expect(
        ofc.connect(other2).transferFrom(other.address, other2.address, 1, {
          from: other2.address,
          value: 1000000000,
        })
      )
        .to.changeTokenBalance(ofc, other, -1)
        .to.changeTokenBalance(ofc, other2, 1)
        .to.changeEtherBalance(artist, 1000000000 * 0.0675)
        .to.changeEtherBalance(owner, 1000000000 * 0.0075)
        .to.changeEtherBalance(other, 1000000000 * 0.925)
        .to.changeEtherBalance(ofc, 0)
        .to.changeEtherBalance(other2, -1000000000);
    });
  });

  describe("Token URL", function () {
    it("Should be toggled", async function () {
      const { ofc, owner, artist, other } = await loadFixture(deployOfcToken);
      await ofc.connect(owner).setBaseUri("ipfs/abcdefg/");
      expect(await ofc.baseURI()).to.equal("ipfs/abcdefg/");
      await ofc.connect(owner).toggleSaleState();
      await ofc.connect(other).mintToken();
      expect(await ofc.tokenURI(1)).to.equal("ipfs/abcdefg/1.json");
    });
  });
});
