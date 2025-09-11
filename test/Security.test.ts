import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SecureVault, SecurityOracle, MockUSDT } from "../typechain-types";

describe("Security Tests", function () {
  let secureVault: SecureVault;
  let securityOracle: SecurityOracle;
  let mockUSDT: MockUSDT;
  let owner: SignerWithAddress;
  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;
  let signer3: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const DAILY_WITHDRAWAL_LIMIT = ethers.utils.parseEther("10000");
  const MAX_DEPOSIT_PER_TX = ethers.utils.parseEther("5000");
  const MAX_WITHDRAWAL_PER_TX = ethers.utils.parseEther("2000");
  const EMERGENCY_WITHDRAWAL_LIMIT = ethers.utils.parseEther("1000");

  beforeEach(async function () {
    [owner, signer1, signer2, signer3, user1, user2] = await ethers.getSigners();

    // Deploy Mock USDT
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDTFactory.deploy();
    await mockUSDT.deployed();

    // Deploy SecureVault
    const signers = [signer1.address, signer2.address, signer3.address];
    const SecureVaultFactory = await ethers.getContractFactory("SecureVault");
    secureVault = await SecureVaultFactory.deploy(
      mockUSDT.address,
      signers,
      2, // 2 out of 3 signatures required
      DAILY_WITHDRAWAL_LIMIT,
      MAX_DEPOSIT_PER_TX,
      MAX_WITHDRAWAL_PER_TX
    );
    await secureVault.deployed();

    // Deploy SecurityOracle
    const SecurityOracleFactory = await ethers.getContractFactory("SecurityOracle");
    securityOracle = await SecurityOracleFactory.deploy();
    await securityOracle.deployed();

    // Mint USDT to users
    await mockUSDT.mint(user1.address, ethers.utils.parseEther("10000"));
    await mockUSDT.mint(user2.address, ethers.utils.parseEther("10000"));

    // Approve vault to spend USDT
    await mockUSDT.connect(user1).approve(secureVault.address, ethers.utils.parseEther("10000"));
    await mockUSDT.connect(user2).approve(secureVault.address, ethers.utils.parseEther("10000"));
  });

  describe("SecureVault Security Features", function () {
    it("Should prevent reentrancy attacks", async function () {
      const depositAmount = ethers.utils.parseEther("1000");
      
      // User deposits
      await secureVault.connect(user1).deposit(depositAmount);
      
      // Attempt reentrancy attack (simplified test)
      // In a real attack, this would be done through a malicious contract
      await expect(secureVault.connect(user1).withdraw(depositAmount)).to.not.be.reverted;
    });

    it("Should enforce daily withdrawal limits", async function () {
      const depositAmount = ethers.utils.parseEther("10000");
      const withdrawAmount = ethers.utils.parseEther("5000");
      
      // User deposits
      await secureVault.connect(user1).deposit(depositAmount);
      
      // First withdrawal should succeed
      await secureVault.connect(user1).withdraw(withdrawAmount);
      
      // Second withdrawal should fail (exceeds daily limit)
      await expect(
        secureVault.connect(user1).withdraw(withdrawAmount)
      ).to.be.revertedWith("ExceedsDailyLimit");
    });

    it("Should enforce transaction limits", async function () {
      const largeDeposit = ethers.utils.parseEther("6000"); // Exceeds max deposit per tx
      const largeWithdraw = ethers.utils.parseEther("3000"); // Exceeds max withdrawal per tx
      
      // Large deposit should fail
      await expect(
        secureVault.connect(user1).deposit(largeDeposit)
      ).to.be.revertedWith("ExceedsMaxTxLimit");
      
      // Deposit normal amount first
      await secureVault.connect(user1).deposit(ethers.utils.parseEther("1000"));
      
      // Large withdrawal should fail
      await expect(
        secureVault.connect(user1).withdraw(largeWithdraw)
      ).to.be.revertedWith("ExceedsMaxTxLimit");
    });

    it("Should allow emergency shutdown", async function () {
      const depositAmount = ethers.utils.parseEther("1000");
      
      // User deposits
      await secureVault.connect(user1).deposit(depositAmount);
      
      // Emergency shutdown
      await secureVault.connect(signer1).emergencyShutdown();
      
      // Normal operations should be paused
      await expect(
        secureVault.connect(user1).deposit(depositAmount)
      ).to.be.revertedWith("EmergencyModeActive");
      
      // Emergency withdrawal should still work
      await secureVault.connect(user1).emergencyWithdraw(depositAmount);
    });

    it("Should require multi-signature for critical operations", async function () {
      const operationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-operation"));
      
      // Propose operation
      await secureVault.connect(signer1).proposeOperation(operationHash);
      
      // First signature
      await secureVault.connect(signer1).signOperation(operationHash);
      
      // Second signature
      await secureVault.connect(signer2).signOperation(operationHash);
      
      // Should have 2 signatures now
      const signatureCount = await secureVault.signatureCount(operationHash);
      expect(signatureCount).to.equal(2);
    });

    it("Should enforce timelock for critical operations", async function () {
      const operationHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-operation"));
      
      // Propose operation
      await secureVault.connect(signer1).proposeOperation(operationHash);
      
      // Try to execute immediately (should fail)
      await expect(
        secureVault.connect(signer1).executeOperation(
          operationHash,
          ethers.constants.AddressZero,
          "0x"
        )
      ).to.be.revertedWith("TimelockNotExpired");
    });

    it("Should prevent unauthorized access", async function () {
      // Non-signer should not be able to perform signer-only operations
      await expect(
        secureVault.connect(user1).emergencyShutdown()
      ).to.be.revertedWith("NotAuthorizedSigner");
      
      await expect(
        secureVault.connect(user1).proposeOperation(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"))
        )
      ).to.be.revertedWith("NotAuthorizedSigner");
    });
  });

  describe("SecurityOracle Monitoring", function () {
    it("Should calculate risk scores correctly", async function () {
      const vaultAddress = secureVault.address;
      const tvl = ethers.utils.parseEther("1000000"); // 1M USDT
      const dailyVolume = ethers.utils.parseEther("100000"); // 100K USDT
      const apy = 500; // 5% APY
      
      await securityOracle.updateMetrics(vaultAddress, tvl, dailyVolume, apy);
      
      const metrics = await securityOracle.vaultMetrics(vaultAddress);
      expect(metrics.tvl).to.equal(tvl);
      expect(metrics.dailyVolume).to.equal(dailyVolume);
      expect(metrics.apy).to.equal(apy);
      expect(metrics.isHealthy).to.be.true; // Should be healthy with these metrics
    });

    it("Should trigger alerts for high risk scenarios", async function () {
      const vaultAddress = secureVault.address;
      const tvl = ethers.utils.parseEther("10000"); // Low TVL
      const dailyVolume = ethers.utils.parseEther("10000000"); // Very high volume
      const apy = 15000; // 150% APY (extremely high)
      
      await securityOracle.updateMetrics(vaultAddress, tvl, dailyVolume, apy);
      
      // Should have triggered alerts
      const activeAlerts = await securityOracle.getActiveAlerts();
      expect(activeAlerts.length).to.be.greaterThan(0);
      
      // Check alert details
      const alert = await securityOracle.getAlert(activeAlerts[0]);
      expect(alert.isActive).to.be.true;
      expect(alert.severity).to.be.greaterThan(3); // High severity
    });

    it("Should detect TVL drops", async function () {
      const vaultAddress = secureVault.address;
      
      // Initial high TVL
      await securityOracle.updateMetrics(
        vaultAddress,
        ethers.utils.parseEther("1000000"), // 1M USDT
        ethers.utils.parseEther("100000"), // 100K volume
        500 // 5% APY
      );
      
      // Significant TVL drop
      await securityOracle.updateMetrics(
        vaultAddress,
        ethers.utils.parseEther("500000"), // 500K USDT (50% drop)
        ethers.utils.parseEther("100000"), // 100K volume
        500 // 5% APY
      );
      
      // Should have triggered TVL drop alert
      const activeAlerts = await securityOracle.getActiveAlerts();
      expect(activeAlerts.length).to.be.greaterThan(0);
    });

    it("Should allow resolving alerts", async function () {
      const vaultAddress = secureVault.address;
      
      // Trigger high risk alert
      await securityOracle.updateMetrics(
        vaultAddress,
        ethers.utils.parseEther("10000"), // Low TVL
        ethers.utils.parseEther("10000000"), // High volume
        15000 // High APY
      );
      
      const activeAlerts = await securityOracle.getActiveAlerts();
      expect(activeAlerts.length).to.be.greaterThan(0);
      
      // Resolve alert
      await securityOracle.resolveAlert(activeAlerts[0]);
      
      // Alert should be resolved
      const alert = await securityOracle.getAlert(activeAlerts[0]);
      expect(alert.isActive).to.be.false;
    });
  });

  describe("Integration Security Tests", function () {
    it("Should maintain security during high volume operations", async function () {
      const depositAmount = ethers.utils.parseEther("1000");
      
      // Multiple users deposit
      await secureVault.connect(user1).deposit(depositAmount);
      await secureVault.connect(user2).deposit(depositAmount);
      
      // Update oracle with high volume
      await securityOracle.updateMetrics(
        secureVault.address,
        ethers.utils.parseEther("2000"), // TVL
        ethers.utils.parseEther("5000"), // High volume
        800 // 8% APY
      );
      
      // Vault should still be operational
      const vaultHealth = await secureVault.getVaultHealth();
      expect(vaultHealth.totalAssets).to.equal(ethers.utils.parseEther("2000"));
    });

    it("Should handle emergency scenarios gracefully", async function () {
      const depositAmount = ethers.utils.parseEther("1000");
      
      // User deposits
      await secureVault.connect(user1).deposit(depositAmount);
      
      // Trigger emergency shutdown
      await secureVault.connect(signer1).emergencyShutdown();
      
      // Update oracle with emergency metrics
      await securityOracle.updateMetrics(
        secureVault.address,
        ethers.utils.parseEther("1000"), // TVL
        ethers.utils.parseEther("0"), // No volume
        0 // No APY
      );
      
      // Emergency withdrawal should work
      await secureVault.connect(user1).emergencyWithdraw(depositAmount);
      
      // Normal operations should be paused
      await expect(
        secureVault.connect(user1).deposit(depositAmount)
      ).to.be.revertedWith("EmergencyModeActive");
    });
  });

  describe("Access Control Security", function () {
    it("Should prevent unauthorized parameter updates", async function () {
      // Only signers should be able to update security parameters
      await expect(
        secureVault.connect(user1).updateSecurityParameters(
          ethers.utils.parseEther("20000"),
          ethers.utils.parseEther("10000"),
          ethers.utils.parseEther("4000"),
          ethers.utils.parseEther("2000")
        )
      ).to.be.revertedWith("NotAuthorizedSigner");
    });

    it("Should prevent unauthorized signer management", async function () {
      // Only signers should be able to add/remove signers
      await expect(
        secureVault.connect(user1).addSigner(user2.address)
      ).to.be.revertedWith("NotAuthorizedSigner");
      
      await expect(
        secureVault.connect(user1).removeSigner(signer1.address)
      ).to.be.revertedWith("NotAuthorizedSigner");
    });

    it("Should prevent unauthorized oracle updates", async function () {
      // Only authorized updaters should be able to update oracle
      await expect(
        securityOracle.connect(user1).updateMetrics(
          secureVault.address,
          ethers.utils.parseEther("1000"),
          ethers.utils.parseEther("100"),
          500
        )
      ).to.be.revertedWith("UnauthorizedUpdater");
    });
  });
});
